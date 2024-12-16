package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// RequestIDConfig holds configuration for the request ID middleware
type RequestIDConfig struct {
	// Generator is a function to generate request IDs
	Generator func() string
	// RequestHeader is the name of the header to read the request ID from
	RequestHeader string
	// ResponseHeader is the name of the header to write the request ID to
	ResponseHeader string
}

// DefaultRequestIDConfig provides default configuration values
func DefaultRequestIDConfig() RequestIDConfig {
	return RequestIDConfig{
		Generator:      nil, // will use echo's default uuid generator
		RequestHeader:  echo.HeaderXRequestID,
		ResponseHeader: echo.HeaderXRequestID,
	}
}

// RequestID returns a middleware that adds a request ID to the request context
func RequestID() echo.MiddlewareFunc {
	return RequestIDWithConfig(DefaultRequestIDConfig())
}

// RequestIDWithConfig returns a middleware with custom configuration
func RequestIDWithConfig(config RequestIDConfig) echo.MiddlewareFunc {
	// convert our config to echo's middleware config
	echoConfig := middleware.RequestIDConfig{
		Generator:      config.Generator,
		RequestHeader:  config.RequestHeader,
		ResponseHeader: config.ResponseHeader,
	}

	return middleware.RequestIDWithConfig(echoConfig)
} 