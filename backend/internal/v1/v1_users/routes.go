package v1_users

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
)

/*
Sets up the v1 user routes.
*/
func SetupUserRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}

	e.POST(
		"/users/:id/details",
		h.handleUpdateUserDetails,
		middleware.Auth(s.GetDB()),
	)
}
