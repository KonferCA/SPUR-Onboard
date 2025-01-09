package v1_teams

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	team := e.Group("/companies/:company_id/team")
	
	// For GET routes, allow both startup owners and investors
	team.GET("", h.handleGetTeamMembers, middleware.Auth(s.GetDB(), 
		permissions.PermSubmitProject,  // Startup owners
		permissions.PermViewAllProjects, // Investors
	))
	team.GET("/:member_id", h.handleGetTeamMember, middleware.Auth(s.GetDB(),
		permissions.PermSubmitProject,
		permissions.PermViewAllProjects,
	))
	
	// For modification routes, only allow startup owners
	team.POST("", h.handleAddTeamMember, middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
	team.PUT("/:member_id", h.handleUpdateTeamMember, middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
	team.DELETE("/:member_id", h.handleDeleteTeamMember, middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
}
