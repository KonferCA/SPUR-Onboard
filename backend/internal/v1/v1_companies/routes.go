package v1_companies

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"

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

	companies.POST("/company/new", h.handleCreateCompany,
		middleware.Auth(s.GetDB(), db.UserRoleStartupOwner),
	)

	companies.GET("/company", h.handleGetCompany,
		middleware.Auth(s.GetDB(), db.UserRoleStartupOwner, db.UserRoleAdmin),
	)

	companies.GET("/company/:id", h.handleGetCompany,
		middleware.Auth(s.GetDB(), db.UserRoleAdmin),
	)

	companies.PUT("/company", h.handleUpdateCompany,
		middleware.Auth(s.GetDB(), db.UserRoleStartupOwner, db.UserRoleAdmin),
	)
}
