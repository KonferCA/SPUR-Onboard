package v1health

import (
	"KonferCA/SPUR/internal/interfaces"

	"github.com/labstack/echo/v4"
)

/*
Sets up all the healthcheck routes for V1.
*/
func SetupHealthcheckRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}
	e.GET("/health", h.handleHealthCheck)
}
