package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func UploadMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Check if the request is multipart/form-data
			if c.Request().Header.Get("Content-Type") != "" && c.Request().Method == "POST" {
				err := c.Request().ParseMultipartForm(10 << 20) // 10 MB
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Failed to parse multipart form")
				}
			}
			return next(c)
		}
	}
} 