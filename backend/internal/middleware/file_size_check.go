package middleware

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

/*
FileSizeConfig holds configuration for the file size check middleware.
MinSize and MaxSize are in bytes.

Example:
    1MB = 1 * 1024 * 1024 bytes
    10MB = 10 * 1024 * 1024 bytes
*/
type FileSizeConfig struct {
	MinSize int64
	MaxSize int64
}

/*
FileSizeCheck middleware ensures uploaded files are within specified size limits.
It checks the Content-Length header and returns 413 if file is too large
or 400 if file is too small.

Usage:
    e.POST("/upload", handler, middleware.FileSizeCheck(middleware.FileSizeConfig{
        MinSize: 1024,        // 1KB minimum
        MaxSize: 10485760,    // 10MB maximum
    }))
*/
func FileSizeCheck(config FileSizeConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// only check on requests that might have file uploads
			if c.Request().Method != http.MethodPost && c.Request().Method != http.MethodPut {
				return next(c)
			}

			// first check content-length as early rejection
			contentLength := c.Request().ContentLength
			if contentLength == -1 {
				return echo.NewHTTPError(http.StatusBadRequest, "content length required")
			}

			if contentLength > config.MaxSize {
				return echo.NewHTTPError(http.StatusRequestEntityTooLarge, 
					fmt.Sprintf("file size %d exceeds maximum allowed size of %d", contentLength, config.MaxSize))
			}

			// parse multipart form with max size limit to prevent memory exhaustion
			if err := c.Request().ParseMultipartForm(config.MaxSize); err != nil {
				return echo.NewHTTPError(http.StatusRequestEntityTooLarge, "file too large")
			}

			// check actual file sizes if the content-length check passed
			// (i don't think it would ever happen, but clients can fake a content-length header)
			form := c.Request().MultipartForm
			if form != nil && form.File != nil {
				for _, files := range form.File {
					for _, file := range files {
						size := file.Size
						if size > config.MaxSize {
							return echo.NewHTTPError(http.StatusRequestEntityTooLarge, 
								fmt.Sprintf("file %s size %d exceeds maximum allowed size of %d", file.Filename, size, config.MaxSize))
						}
						if size < config.MinSize {
							return echo.NewHTTPError(http.StatusBadRequest, 
								fmt.Sprintf("file %s size %d below minimum required size of %d", file.Filename, size, config.MinSize))
						}
					}
				}
			}

			return next(c)
		}
	}
} 