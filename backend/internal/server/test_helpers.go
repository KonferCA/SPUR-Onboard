package server

import (
	"github.com/labstack/echo/v4"
)

// TestIPMiddleware adds a fake IP (for testing rate limits)
func TestIPMiddleware(ip string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Request().Header.Set("X-Real-IP", ip)
			return next(c)
		}
	}
}
