package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	projects := g.Group("/project")
	projects.Use(middleware.AuthWithConfig(middleware.AuthConfig{
		AcceptTokenType: "access_token",
		AcceptUserRoles: []db.UserRole{db.UserRoleStartupOwner},
	}, s.GetDB()))
	
	projects.POST("/new", h.handleCreateProject)
	projects.GET("", h.handleListCompanyProjects)
	projects.GET("/:id", h.handleGetProject)
	projects.GET("/:id/answers", h.handleGetProjectAnswers)
	projects.PATCH("/:id/answer", h.handlePatchProjectAnswer)
	projects.POST("/:id/document", h.handleUploadProjectDocument)
	projects.GET("/:id/documents", h.handleGetProjectDocuments)
	projects.DELETE("/:id/document/:document_id", h.handleDeleteProjectDocument)
	projects.POST("/:id/submit", h.handleSubmitProject, middleware.Auth(s.GetDB(), db.UserRoleStartupOwner))
}
