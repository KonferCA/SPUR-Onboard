package middleware

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

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
	MinSize          int64
	MaxSize          int64
	AllowedTypes     []string // ex. ["image/jpeg", "image/png", "application/pdf"]
	StrictValidation bool // If true, always verify content type matches header
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
		declaredType := file.Header.Get("Content-Type")
		declaredType = strings.Split(declaredType, ";")[0] // Remove parameters

		// If no Content-Type header or strict validation is enabled, check actual content
		if declaredType == "" || config.StrictValidation {
			f, err := file.Open()
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "could not read file")
			}
			defer f.Close()

			mime, err := mimetype.DetectReader(f)
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "could not detect file type")
			}

			actualType := mime.String()

			// If we have both types, verify they match (when strict validation is enabled)
			if declaredType != "" && config.StrictValidation && !strings.EqualFold(declaredType, actualType) {
				return echo.NewHTTPError(http.StatusBadRequest,
					fmt.Sprintf("declared Content-Type (%s) doesn't match actual content type (%s)", 
						declaredType, actualType))
			}

			// Use actual type if no declared type, otherwise use declared type
			if declaredType == "" {
				declaredType = actualType
			}
		}

		isAllowed := false
		for _, allowed := range config.AllowedTypes {
			if strings.EqualFold(declaredType, allowed) {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			return echo.NewHTTPError(http.StatusBadRequest,
				fmt.Sprintf("file type %s not allowed for %s. Allowed types: %v", 
					declaredType, file.Filename, config.AllowedTypes))
		}
	}

	return nil
}