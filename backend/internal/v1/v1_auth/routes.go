package v1_auth

import (
	"KonferCA/SPUR/internal/interfaces"

	"github.com/labstack/echo/v4"
)

func SetupAuthRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}
	e.GET("/auth/ami-verified", h.handleEmailVerificationStatus)
}
