package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// RequestID returns a middleware that adds a request ID to the request context
func RequestID() echo.MiddlewareFunc {
	return middleware.RequestID()
} 