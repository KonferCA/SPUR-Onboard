package server

import (
	"mime"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (s *Server) setupStaticRoutes() {
	// add mime types
	mime.AddExtensionType(".js", "application/javascript")
	mime.AddExtensionType(".css", "text/css")
	mime.AddExtensionType(".html", "text/html")

	// hardcode static directory
	staticDir := "static/dist"

	// serve static files, excluding API routes
	s.echoInstance.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       staticDir,
		Index:      "index.html",
		HTML5:      true,
		Browse:     false,
		IgnoreBase: true,
		Skipper: func(c echo.Context) bool {
			// Skip static file handling for API routes
			return strings.HasPrefix(c.Request().URL.Path, "/api/")
		},
	}))

	// serve assets with correct mime types
	s.echoInstance.GET("/assets/*", func(c echo.Context) error {
		// url decode and clean the path
		requestedPath, err := url.QueryUnescape(c.Param("*"))
		if err != nil {
			return echo.NewHTTPError(http.StatusForbidden, "invalid path")
		}

		requestedPath = filepath.Clean(requestedPath)
		if strings.Contains(requestedPath, "..") {
			return echo.NewHTTPError(http.StatusForbidden, "invalid path")
		}

		// create a safe path within static directory
		path := filepath.Join(staticDir, "assets", requestedPath)

		// verify the final path is still within the static directory
		absStaticDir, _ := filepath.Abs(staticDir)
		absPath, _ := filepath.Abs(path)
		if !strings.HasPrefix(absPath, absStaticDir) {
			return echo.NewHTTPError(http.StatusForbidden, "invalid path")
		}

		return c.File(path)
	})

	// catch all route
	s.echoInstance.GET("/*", func(c echo.Context) error {
		if strings.HasPrefix(c.Path(), "/api") {
			return echo.NotFoundHandler(c)
		}
		return c.File(filepath.Join(staticDir, "index.html"))
	})
}
