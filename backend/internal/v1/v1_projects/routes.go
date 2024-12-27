package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	// Base project routes
	projects := g.Group("/project", middleware.AuthWithConfig(middleware.AuthConfig{
		AcceptTokenType: "access_token",
		AcceptUserRoles: []db.UserRole{db.UserRoleStartupOwner},
	}, s.GetDB()))

	// Project management
	projects.POST("/new", h.handleCreateProject)
	projects.GET("", h.handleListCompanyProjects)
	projects.GET("/:id", h.handleGetProject)
	projects.POST("/:id/submit", h.handleSubmitProject)

	// Project answers
	answers := projects.Group("/:id/answers")
	answers.GET("", h.handleGetProjectAnswers)
	answers.PATCH("", h.handlePatchProjectAnswer)

	// Project documents
	docs := projects.Group("/:id/documents")
	docs.POST("", h.handleUploadProjectDocument)
	docs.GET("", h.handleGetProjectDocuments)
	docs.DELETE("/:document_id", h.handleDeleteProjectDocument)
}
