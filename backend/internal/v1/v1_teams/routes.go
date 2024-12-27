package v1_teams

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	team := e.Group("/companies/:company_id/team")
	
	// For GET routes, we need to allow both owners and investors
	team.GET("", h.handleGetTeamMembers, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner, db.UserRoleInvestor))
	team.GET("/:member_id", h.handleGetTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner, db.UserRoleInvestor))
	
	// For modification routes, only allow owners
	team.POST("", h.handleAddTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	team.PUT("/:member_id", h.handleUpdateTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	team.DELETE("/:member_id", h.handleDeleteTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
}
