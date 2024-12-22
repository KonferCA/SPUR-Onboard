package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
)

/*
Sets up the V1 auth routes.
*/
func SetupAuthRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}
	e.GET(
		"/auth/ami-verified",
		h.handleEmailVerificationStatus,
		middleware.Auth(s.GetDB(), db.UserRoleStartupOwner, db.UserRoleAdmin, db.UserRoleStartupOwner),
	)
	e.GET("/auth/verify-email", h.handleVerifyEmail)
	e.POST("/auth/register", h.handleRegister)
	e.GET("/auth/verify", h.handleVerifyCookie)
}
