// Package middleware provides Echo middleware functions for the SPUR backend
package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"time"
)

/*
Logger Middleware

This middleware integrates with the SPUR backend's logging system to provide
structured request logging. It uses the global zerolog configuration from main.go
for timestamp formatting.

Key Features:
- Captures request ID for distributed tracing
- Records request method, path, and client IP
- Measures request processing duration
- Logs final response status code
- Includes error details when requests fail

Integration:
The middleware is set up in backend/internal/server/middleware.go along with
other global middlewares like RequestID. It should be added after RequestID
but before route-specific middleware.
*/
func Logger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			req := c.Request()
			res := c.Response()

			// extract request id that was set by the RequestID middleware
			requestID := req.Header.Get(echo.HeaderXRequestID)
			if requestID == "" {
				// fallback in case RequestID middleware wasn't used
				requestID = res.Header().Get(echo.HeaderXRequestID)
			}

			// process request
			err := next(c)

			// prepare log entry
			logger := log.Info()

			// handle different types of errors
			if err != nil {
				logger = log.Error().Err(err)
				
				// handle echo's HTTPError type
				if he, ok := err.(*echo.HTTPError); ok {
					res.Status = he.Code
					logger.Int("error_code", he.Code)
					if msg, ok := he.Message.(string); ok {
						logger.Str("error_message", msg)
					}
				} else {
					// for non-HTTP errors, use 500
					res.Status = echo.ErrInternalServerError.Code
				}
			}

			// log request completion with all details
			logger.
				Str("request_id", requestID).
				Str("method", req.Method).
				Str("path", req.URL.Path).
				Str("remote_ip", c.RealIP()).
				Str("user_agent", req.UserAgent()).
				Int("status", res.Status).
				Dur("latency", time.Since(start)).
				Msg("request completed")

			return err
		}
	}
} 