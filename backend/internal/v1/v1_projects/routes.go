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
	projects.POST("/:id/answer", h.handleCreateAnswer)
	answers.PATCH("", h.handlePatchProjectAnswer)

	// Project documents
	docs := projects.Group("/:id/documents")
	docs.POST("", h.handleUploadProjectDocument, middleware.FileCheck(middleware.FileConfig{
		MinSize: 1024,                    // 1KB minimum
		MaxSize: 10 * 1024 * 1024,       // 10MB maximum
		AllowedTypes: []string{
			"application/pdf",
			"application/msword",                                                  		// .doc
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document", 	// .docx
			"application/vnd.ms-excel",                                          		// .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 		// .xlsx
			"image/jpeg",
			"image/png",
		},
		StrictValidation: true,
	}))
	docs.GET("", h.handleGetProjectDocuments)
	docs.DELETE("/:document_id", h.handleDeleteProjectDocument)
	
	g.GET("/questions", h.handleGetQuestions)
}
