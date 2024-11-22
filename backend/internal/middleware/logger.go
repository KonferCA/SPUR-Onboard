package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

// Logger is a middleware that logs the request and response basic information.
func Logger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			method := c.Request().Method
			path := c.Request().URL.Path
			requestId := c.Request().Header.Get(echo.HeaderXRequestID)
			xRealIp := c.Request().Header.Get(echo.HeaderXRealIP)
			realIp := c.RealIP()
			remoteAddr := c.Request().RemoteAddr
			contentType := c.Request().Header.Get(echo.HeaderContentType)
			contentLength := c.Request().Header.Get(echo.HeaderContentLength)
			userAgent := c.Request().UserAgent()
			// before processing the request
			log.Info().
				Str("method", method).
				Str("path", path).
				Str(echo.HeaderXRequestID, requestId).
				Str(echo.HeaderXRealIP, xRealIp).
				Str(echo.HeaderContentType, contentType).
				Str(echo.HeaderContentLength, contentLength).
				Str("remote_addr", remoteAddr).
				Str("user_agent", userAgent).
				Str("real_ip", realIp).
				Msg("New request!")

				// process the request
			err := next(c)
			// after processing the request
			if err != nil {
				log.Error().
					Err(err).
					Str(echo.HeaderXRequestID, requestId).
					Str(echo.HeaderContentType, c.Response().Header().Get(echo.HeaderContentType)).
					Str(echo.HeaderContentLength, c.Response().Header().Get(echo.HeaderContentLength)).
					Send()
			}
			log.Info().
				Str(echo.HeaderXRequestID, requestId).
				Str(echo.HeaderContentType, c.Response().Header().Get(echo.HeaderContentType)).
				Str(echo.HeaderContentLength, c.Response().Header().Get(echo.HeaderContentLength)).
				Msg("Requested processed.")
			return err
		}
	}
}
