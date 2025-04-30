package v1_projects

import (
	"os"
	"time"

	"KonferCA/SPUR/common"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	// 5 request per minute, get block for 15 minutes, and ban up to 1 hour after four blocks.
	maxRequests := 5
	if os.Getenv("APP_ENV") == common.TEST_ENV {
		maxRequests = 5000
	}

	publicProjectsLimiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
		Requests:    maxRequests,
		Window:      time.Minute,
		BlockPeriod: time.Minute * 15,
		MaxBlocks:   4,
	})

	// Base project routes with auth
	project := g.Group("/project", middleware.Auth(s.GetDB(),
		permissions.PermSubmitProject,
		permissions.PermViewAllProjects,
	))

	g.GET("/projects", h.handleListCompanyProjects, middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
	g.GET("/project/list/all", h.handleListAllProjects, middleware.Auth(s.GetDB(), permissions.PermAdmin))

	// Get new projects
	g.GET("/project/latest", h.handleGetNewProjects, publicProjectsLimiter.RateLimit())

	g.GET("/project/featured", h.handleGetFeaturedProjects, publicProjectsLimiter.RateLimit())

	// Update project status
	g.PUT("/project/:id/status", h.handleUpdateProjectStatus, middleware.Auth(s.GetDB(), permissions.PermAdmin))

	g.PUT("/project/:id/featured", h.handleSetProjectFeatured, middleware.Auth(s.GetDB(), permissions.PermAdmin))

	// Static routes - require project submission permission
	projectSubmitGroup := project.Group("", middleware.Auth(s.GetDB(), permissions.PermSubmitProject))
	projectSubmitGroup.POST("/new", h.handleCreateProject)
	projectSubmitGroup.GET("/list", h.handleListCompanyProjects)
	projectSubmitGroup.POST("/:id/draft", h.handleSaveProjectDraft)
	// Project snapshots routes
	projectSubmitGroup.GET("/:project_id/snapshots/latest", h.handleGetLatestProjectSnapshot)

	// Questions route - viewable by anyone with project access
	project.GET("/questions", h.handleGetQuestions)

	// Dynamic :id routes
	project.GET("/:id", h.handleGetProject)
	projectSubmitGroup.POST("/:id/submit", h.handleSubmitProject)

	// Project answers - require project submission permission
	answers := projectSubmitGroup.Group("/:id/answers")
	answers.GET("", h.handleGetProjectAnswers)
	answers.POST("", h.handleCreateAnswer)
	answers.PATCH("", h.handlePatchProjectAnswer)

	// Project documents - require project submission permission
	docs := projectSubmitGroup.Group("/:id/documents")
	docs.POST("", h.handleUploadProjectDocument, middleware.FileCheck(middleware.FileConfig{
		MinSize: 1024,             // 1KB minimum
		MaxSize: 10 * 1024 * 1024, // 10MB maximum
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

	// Project comments - require comment permissions
	comments := project.Group("/:id/comments", middleware.Auth(s.GetDB(),
		permissions.PermViewAllProjects,
		permissions.PermCommentOnProjects,
	))

	comments.GET("", h.handleGetProjectComments)
	comments.GET("/:comment_id", h.handleGetProjectComment)
	comments.PUT("/:comment_id", h.handleUpdateProjectComment)
	comments.POST("/:comment_id/resolve", h.handleResolveComment)
	comments.POST("/:comment_id/unresolve", h.handleUnresolveComment)

	// Admin-only comment resolution endpoints - require both comment and admin permissions
	adminComments := comments.Group("", middleware.Auth(s.GetDB(),
		permissions.PermViewAllProjects,
		permissions.PermCommentOnProjects,
		permissions.PermAdmin,
	))
	adminComments.POST("", h.handleCreateProjectComment)
}
