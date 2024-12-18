package middleware

import (
	"fmt"
	"mime/multipart"
	"net/http"

	"github.com/gabriel-vasile/mimetype"
	"github.com/labstack/echo/v4"
)

/*
FileConfig holds configuration for the file validation middleware.
MinSize and MaxSize are in bytes.

Example:
    1MB = 1 * 1024 * 1024 bytes
    10MB = 10 * 1024 * 1024 bytes
*/
type FileConfig struct {
	MinSize      int64
	MaxSize      int64
	AllowedTypes []string // e.g. ["image/jpeg", "image/png", "application/pdf"]
}

/*
FileCheck middleware ensures uploaded files meet specified criteria:
- Size limits (via Content-Length header and actual file size)
- MIME type validation

Usage:
    e.POST("/upload", handler, middleware.FileCheck(middleware.FileConfig{
        MinSize: 1024,        // 1KB minimum
        MaxSize: 10485760,    // 10MB maximum
        AllowedTypes: []string{
            "image/jpeg",
            "image/png",
            "application/pdf",
        },
    }))
*/
func FileCheck(config FileConfig) echo.MiddlewareFunc {
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

			// check actual file sizes and MIME types
			form := c.Request().MultipartForm
			if form != nil && form.File != nil {
				for _, files := range form.File {
					for _, file := range files {
						if err := validateFile(file, config); err != nil {
							return err
						}
					}
				}
			}

			return next(c)
		}
	}
}

// validateFile checks both size and MIME type of a single file
func validateFile(file *multipart.FileHeader, config FileConfig) error {
	// Check file size
	size := file.Size
	if size > config.MaxSize {
		return echo.NewHTTPError(http.StatusRequestEntityTooLarge,
			fmt.Sprintf("file %s size %d exceeds maximum allowed size of %d", file.Filename, size, config.MaxSize))
	}
	if size < config.MinSize {
		return echo.NewHTTPError(http.StatusBadRequest,
			fmt.Sprintf("file %s size %d below minimum required size of %d", file.Filename, size, config.MinSize))
	}

	// Check MIME type if restrictions are specified
	if len(config.AllowedTypes) > 0 {
		f, err := file.Open()
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "could not read file")
		}
		defer f.Close()

		mime, err := mimetype.DetectReader(f)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "could not detect file type")
		}

		isAllowed := false
		for _, allowed := range config.AllowedTypes {
			if mime.Is(allowed) {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			return echo.NewHTTPError(http.StatusBadRequest,
				fmt.Sprintf("file type %s not allowed. Allowed types: %v", mime.String(), config.AllowedTypes))
		}
	}

	return nil
}