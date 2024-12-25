package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"
	"net"
	"fmt"
	"io"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
visitor tracks the request statistics for a single IP address. 
*/
type visitor struct {
	lastSeen    time.Time
	count       int
	blockTime   time.Time
	totalBlocks int
}

/*
RateLimiter implements rate limiting with IP-based blocking capability.
It uses a token bucket algorithm and supports progressive penalties.
*/
type RateLimiter struct {
	visitors    map[string]*visitor
	mu          sync.RWMutex
	window      time.Duration
	limit       int
	blockPeriod time.Duration
	maxBlocks   int
}

/*
RateLimiterConfig holds the configuration options for the rate limiter.
*/
type RateLimiterConfig struct {
	Requests    int
	Window      time.Duration
	BlockPeriod time.Duration
	MaxBlocks   int
}

/*
NewRateLimiter creates a new rate limiter with specified configuration.
If config is nil, default values are used.
*/
func NewRateLimiter(config *RateLimiterConfig) *RateLimiter {
	if config == nil {
		config = &RateLimiterConfig{
			Requests:    60,
			Window:      time.Minute,
			BlockPeriod: time.Minute * 15,
			MaxBlocks:   4,
		}
	}

	return &RateLimiter{
		visitors:    make(map[string]*visitor),
		window:      config.Window,
		limit:       config.Requests,
		blockPeriod: config.BlockPeriod,
		maxBlocks:   config.MaxBlocks,
	}
}

/*
getClientIP attempts to get the real client IP, only trusting Cloudflare headers
when the request is verified to come from Cloudflare.
*/
func getClientIP(c echo.Context) string {
	// check if request is from cloudflare by verifying CF-Connecting-IP exists
	// AND the request is from a Cloudflare IP range
	if cfIP := c.Request().Header.Get("CF-Connecting-IP"); cfIP != "" && isCloudflareIP(c.RealIP()) {
		return cfIP
	}

	// if not from cloudflare, only trust the direct remote address
	return c.RealIP()
}

var (
	parsedCloudflareRanges []*net.IPNet
	ipRangesMutex         sync.RWMutex
)

const (
	cfIPv4Endpoint = "https://www.cloudflare.com/ips-v4"
	cfIPv6Endpoint = "https://www.cloudflare.com/ips-v6"
	// refresh every 24 hours
	cfIPRefreshInterval = 24 * time.Hour
)

func init() {
	// Initial load of IP ranges
	if err := refreshCloudflareIPRanges(); err != nil {
		log.Error().Err(err).Msg("failed to load initial Cloudflare IP ranges")
	}

	// Start background refresh
	go func() {
		ticker := time.NewTicker(cfIPRefreshInterval)
		defer ticker.Stop()

		for range ticker.C {
			if err := refreshCloudflareIPRanges(); err != nil {
				log.Error().Err(err).Msg("failed to refresh Cloudflare IP ranges")
			}
		}
	}()
}

func refreshCloudflareIPRanges() error {
	// Fetch both IPv4 and IPv6 ranges
	ranges := make([]string, 0)
	
	for _, endpoint := range []string{cfIPv4Endpoint, cfIPv6Endpoint} {
		resp, err := http.Get(endpoint)
		if err != nil {
			return fmt.Errorf("failed to fetch Cloudflare IPs from %s: %w", endpoint, err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %w", err)
		}

		// Split response into lines
		cidrs := strings.Split(string(body), "\n")
		for _, cidr := range cidrs {
			if cidr = strings.TrimSpace(cidr); cidr != "" {
				ranges = append(ranges, cidr)
			}
		}
	}

	// Parse the new ranges
	newRanges := make([]*net.IPNet, 0, len(ranges))
	for _, cidr := range ranges {
		_, ipnet, err := net.ParseCIDR(cidr)
		if err != nil {
			log.Error().Err(err).Str("cidr", cidr).Msg("failed to parse Cloudflare IP range")
			continue
		}
		newRanges = append(newRanges, ipnet)
	}

	// Update the global ranges atomically
	ipRangesMutex.Lock()
	parsedCloudflareRanges = newRanges
	ipRangesMutex.Unlock()

	log.Info().Int("count", len(newRanges)).Msg("refreshed Cloudflare IP ranges")
	return nil
}

func isCloudflareIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return false
	}

	ipRangesMutex.RLock()
	defer ipRangesMutex.RUnlock()

	for _, ipRange := range parsedCloudflareRanges {
		if ipRange.Contains(ip) {
			return true
		}
	}
	return false
}

/*
RateLimit creates a middleware function that can be applied to specific routes.
It implements rate limiting based on client IP addresses.

Example (auth):

	// in the route setup for a handler:
	authLimiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
	    Requests:    3,               // 3 requests
	    Window:      time.Minute,     // per minute
	    BlockPeriod: time.Minute * 15, // 15 minute block
	    MaxBlocks:   4,               // up to 1 hour block
	})

	g := e.Group("/auth")
	g.POST("/login", handleLogin, authLimiter.RateLimit())
	g.POST("/register", handleRegister, authLimiter.RateLimit())
*/
func (rl *RateLimiter) RateLimit() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := getClientIP(c)
			now := time.Now()

			rl.mu.Lock()
			v, exists := rl.visitors[ip]

			if !exists {
				rl.visitors[ip] = &visitor{
					lastSeen: now,
					count:    1,
				}
				rl.mu.Unlock()

				return next(c)
			}

			if now.Sub(v.lastSeen) > rl.window && now.After(v.blockTime) {
				delete(rl.visitors, ip)
				rl.visitors[ip] = &visitor{
					lastSeen: now,
					count:    1,
				}
				rl.mu.Unlock()

				return next(c)
			}

			if now.Before(v.blockTime) {
				remaining := v.blockTime.Sub(now)
				rl.mu.Unlock()

				log.Warn().
					Str("ip", ip).
					Dur("remaining", remaining).
					Msg("request blocked: rate limit exceeded")

				return echo.NewHTTPError(
					http.StatusTooManyRequests,
					"too many requests, please try again in "+remaining.Round(time.Second).String(),
				)
			}

			if now.Sub(v.lastSeen) > rl.window {
				v.count = 1
				v.lastSeen = now
				rl.mu.Unlock()

				return next(c)
			}

			v.count++
			if v.count > rl.limit {
				v.totalBlocks++
				multiplier := min(v.totalBlocks, rl.maxBlocks)
				blockDuration := rl.blockPeriod * time.Duration(multiplier)
				v.blockTime = now.Add(blockDuration)

				rl.mu.Unlock()

				log.Warn().
					Str("ip", ip).
					Int("violations", v.totalBlocks).
					Dur("block_duration", blockDuration).
					Msg("IP blocked: rate limit exceeded")

				return echo.NewHTTPError(
					http.StatusTooManyRequests,
					"too many requests, please try again in "+blockDuration.Round(time.Second).String(),
				)
			}

			v.lastSeen = now
			rl.mu.Unlock()

			return next(c)
		}
	}
}
