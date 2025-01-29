package v1_companies

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
)

func NewHandler(s interfaces.CoreServer) *Handler {
	return &Handler{server: s}
}

/*
SetupCompanyRoutes registers all V1 company routes.
*/
func SetupCompanyRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := NewHandler(s)
	companies := e.Group("")

	// Setup all the routes for creating a new company
	// Auth: Startup owners only
	companies.POST("/company/new", h.handleCreateCompany,
		middleware.Auth(s.GetDB(), permissions.PermSubmitProject),
	)

	// Setup all the routes for getting own company
	// Auth: Startup owners or admins
	companies.GET("/company", h.handleGetCompany,
		middleware.Auth(s.GetDB(), permissions.PermSubmitProject),
	)

	// Setup all the routes for getting a single company
	// Auth: Admins only
	companies.GET("/company/:id", h.handleGetCompany,
		middleware.Auth(s.GetDB(), permissions.PermViewAllProjects),
	)

	// Setup all the routes for updating a company
	// Auth: Startup owners only (owner can only update their own company)
	companies.PUT("/company", h.handleUpdateCompany,
		middleware.Auth(s.GetDB(), permissions.PermSubmitProject),
	)
}
