package v1_teams

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	// Create middleware instances
	authBoth := middleware.Auth(s.GetDB(), 
		permissions.PermStartupOwner,  // Startup owners
		permissions.PermViewAllProjects, // Investors
	)
	authOwner := middleware.Auth(s.GetDB(), permissions.PermStartupOwner)
	companyAccess := middleware.CompanyAccess(s.GetDB())

	// Create base group for team routes
	team := e.Group("/companies/:company_id/team")

	// GET routes - require either startup owner or investor permission
	teamGet := team.Group("", authBoth, companyAccess)
	teamGet.GET("", h.handleGetTeamMembers)
	teamGet.GET("/:member_id", h.handleGetTeamMember)
	
	// Modification routes - require startup owner permission
	teamModify := team.Group("", authOwner, companyAccess)
	teamModify.POST("", h.handleAddTeamMember)
	teamModify.PUT("/:member_id", h.handleUpdateTeamMember)
	teamModify.DELETE("/:member_id", h.handleDeleteTeamMember)
}
