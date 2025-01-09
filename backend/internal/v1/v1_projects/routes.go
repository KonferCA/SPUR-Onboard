package v1_projects

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	// Base project routes with auth
	projects := g.Group("/project", middleware.Auth(s.GetDB(), 
		permissions.PermSubmitProject, 
		permissions.PermViewAllProjects,
	))

	// Static routes - require project submission permission
	projectSubmitGroup := projects.Group("", middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
	projectSubmitGroup.POST("/new", h.handleCreateProject)
	projectSubmitGroup.GET("", h.handleListCompanyProjects)

	// Questions route - viewable by anyone with project access
	projects.GET("/questions", h.handleGetQuestions)

	// Dynamic :id routes
	projects.GET("/:id", h.handleGetProject)
	projectSubmitGroup.POST("/:id/submit", h.handleSubmitProject)

	// Project answers - require project submission permission
	answers := projectSubmitGroup.Group("/:id/answers")
	answers.GET("", h.handleGetProjectAnswers)
	answers.POST("", h.handleCreateAnswer)
	answers.PATCH("", h.handlePatchProjectAnswer)

	// Project documents - require project submission permission
	docs := projectSubmitGroup.Group("/:id/documents")
	docs.POST("", h.handleUploadProjectDocument, middleware.FileCheck(middleware.FileConfig{
		MinSize: 1024,                    // 1KB minimum
		MaxSize: 10 * 1024 * 1024,        // 10MB maximum
		AllowedTypes: []string{
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"image/jpeg",
			"image/png",
		},
		StrictValidation: true,
	}))
	docs.GET("", h.handleGetProjectDocuments)
	docs.DELETE("/:document_id", h.handleDeleteProjectDocument)
	
	// Project comments - require admin permissions
	comments := projects.Group("/:id/comments", middleware.Auth(s.GetDB(), 
		permissions.PermManageProjects,
	))

	comments.GET("", h.handleGetProjectComments)
	comments.GET("/:comment_id", h.handleGetProjectComment)
	comments.POST("", h.handleCreateProjectComment)
	comments.PUT("/:comment_id", h.handleUpdateProjectComment)
	comments.POST("/:comment_id/resolve", h.handleResolveComment)
	comments.POST("/:comment_id/unresolve", h.handleUnresolveComment)
}
