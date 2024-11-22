package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type visitor struct {
	lastSeen  time.Time
	count     int
	blockTime time.Time
}

type RateLimiter struct {
	visitors    map[string]*visitor
	mu          sync.RWMutex
	limit       int
	window      time.Duration
	blockPeriod time.Duration
}

func NewRateLimiter(limit int, window, blockPeriod time.Duration) *RateLimiter {
	return &RateLimiter{
		visitors:    make(map[string]*visitor),
		limit:       limit,
		window:      window,
		blockPeriod: blockPeriod,
	}
}

func (rl *RateLimiter) isBlocked(ip string) bool {
	rl.mu.RLock()
	v, exists := rl.visitors[ip]
	rl.mu.RUnlock()

	if !exists {
		return false
	}

	return time.Now().Before(v.blockTime)
}

func (rl *RateLimiter) RateLimit() echo.MiddlewareFunc {
	// cleanup old entries every minute
	go func() {
		for {
			time.Sleep(time.Minute)
			rl.mu.Lock()
			for ip, v := range rl.visitors {
				if time.Since(v.lastSeen) > rl.window && time.Now().After(v.blockTime) {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()

			// check if ip is blocked
			if rl.isBlocked(ip) {
				return echo.NewHTTPError(http.StatusTooManyRequests, "too many requests, please try again later")
			}

			rl.mu.Lock()
			v, exists := rl.visitors[ip]
			if !exists {
				rl.visitors[ip] = &visitor{
					lastSeen: time.Now(),
					count:    1,
				}
			} else {
				// reset count if window has passed
				if time.Since(v.lastSeen) > rl.window {
					v.count = 1
					v.lastSeen = time.Now()
				} else {
					v.count++
					// block if limit exceeded
					if v.count > rl.limit {
						v.blockTime = time.Now().Add(rl.blockPeriod)
						rl.mu.Unlock()
						return echo.NewHTTPError(http.StatusTooManyRequests, "too many requests, please try again later")
					}
				}
			}
			rl.mu.Unlock()

			return next(c)
		}
	}
}

// NewTestRateLimiter makes a cooler rate limiter with shorter durations for testing
func NewTestRateLimiter(limit int) *RateLimiter {
	return &RateLimiter{
		visitors:    make(map[string]*visitor),
		limit:       limit,
		window:      100 * time.Millisecond, // 100ms window for testing
		blockPeriod: 200 * time.Millisecond, // 200ms block for testing
	}
}
