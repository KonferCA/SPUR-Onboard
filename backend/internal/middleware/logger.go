// Package middleware provides Echo middleware functions for the SPUR backend
package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type contextKey string
const loggerContextKey contextKey = "logger"

/*
Logger provides a simplified interface for structured logging throughout the application.
It automatically includes request context (request ID, path, method) in all log entries
while providing a clean interface for developers.

Usage in handlers:
    logger := middleware.GetLogger(c)
    logger.Info("starting process")
    logger.Error(err, "process failed")
    logger.Warn("suspicious activity", optionalError)
*/
type Logger struct {
	baseLogger *zerolog.Logger
}

func (l *Logger) Info(msg string) {
	l.baseLogger.Info().Msg(msg)
}

func (l *Logger) Error(err error, msg string) {
	l.baseLogger.Error().Err(err).Msg(msg)
}

func (l *Logger) Warn(msg string, err ...error) {
	logger := l.baseLogger.Warn()
	if len(err) > 0 && err[0] != nil {
		logger = logger.Err(err[0])
	}
	logger.Msg(msg)
}

/*
GetLogger retrieves the request-scoped logger from the echo context.
If no logger is found, returns a default logger.

The returned logger automatically includes request context in all log entries.
*/
func GetLogger(c echo.Context) *Logger {
	if l, ok := c.Get(string(loggerContextKey)).(*Logger); ok {
		return l
	}
	defaultLogger := log.With().Logger()
	return &Logger{baseLogger: &defaultLogger}
}

/*
LoggerMiddleware initializes a request-scoped logger and stores it in the context.
The logger includes request ID, method, and path in all subsequent log entries.
*/
func LoggerMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get request ID from header OR response header (in case middleware set it)
			requestID := c.Request().Header.Get(echo.HeaderXRequestID)
			if requestID == "" {
				requestID = c.Response().Header().Get(echo.HeaderXRequestID)
			}

			// Create logger with request context
			baseLogger := log.With().
				Str("request_id", requestID).
				Str("method", c.Request().Method).
				Str("path", c.Request().URL.Path).
				Logger()

			c.Set(string(loggerContextKey), &Logger{
				baseLogger: &baseLogger,
			})

			return next(c)
		}
	}
} 