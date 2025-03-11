package v1_users

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
)

/*
Sets up the v1 user routes.
*/
func SetupUserRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}

	// User details routes
	e.POST(
		"/users/:id/details",
		h.handleUpdateUserDetails,
		middleware.Auth(s.GetDB()),
	)

	e.GET(
		"/users/:id/details",
		h.handleGetUserDetails,
		middleware.Auth(s.GetDB()),
	)

	// Profile picture upload route
	e.POST(
		"/users/:id/profile-picture",
		h.handleUploadProfilePicture,
		middleware.Auth(s.GetDB()),
		middleware.FileCheck(middleware.FileConfig{
			MinSize:          1024,            // 1KB minimum
			MaxSize:          5 * 1024 * 1024, // 5MB maximum
			AllowedTypes:     []string{"image/jpeg", "image/png"},
			StrictValidation: true,
		}),
	)

	e.DELETE(
		"/users/:id/profile-picture",
		h.handleRemoveProfilePicture,
		middleware.Auth(s.GetDB()),
	)

	// Admin-only routes for managing users
	e.GET(
		"/users",
		h.handleListUsers,
		middleware.Auth(s.GetDB(), permissions.PermAdmin),
	)

	e.PUT(
		"/users/:id/role",
		h.handleUpdateUserRole,
		middleware.Auth(s.GetDB(), permissions.PermAdmin),
	)

	e.PUT(
		"/users/role/bulk",
		h.handleUpdateUsersRole,
		middleware.Auth(s.GetDB(), permissions.PermAdmin),
	)
}
