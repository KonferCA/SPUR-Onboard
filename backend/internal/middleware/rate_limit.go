package middleware

import (
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"KonferCA/SPUR/common"
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
			var ip string
			
			env := os.Getenv("APP_ENV")
			if env == common.TEST_ENV || env == common.DEVELOPMENT_ENV {
				ip = c.Request().Header.Get("CF-Connecting-IP")
				if ip == "" {
					ip = c.Request().Header.Get("X-Real-IP")
					if ip == "" {
						// Fallback to direct IP in test/dev
						ip = c.RealIP()
					}
				}
			} else {
				ip = c.Request().Header.Get("CF-Connecting-IP")
			}

			if ip == "" {
				return echo.NewHTTPError(http.StatusForbidden, "missing client IP")
			}

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
