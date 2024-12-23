package v1_teams

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := Handler{server: s}

	e.POST("/companies/:company_id/team", h.handleAddTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	e.GET("/companies/:company_id/team", h.handleGetTeamMembers, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	e.GET("/companies/:company_id/team/:member_id", h.handleGetTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	e.PUT("/companies/:company_id/team/:member_id", h.handleUpdateTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
	e.DELETE("/companies/:company_id/team/:member_id", h.handleDeleteTeamMember, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
}
