package v1_investment_intentions

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
)

func SetupInvestmentIntentionRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}

	// investment intentions routes
	intentions := g.Group("/investment-intentions")

	// create investment intention - investors only
	intentions.POST("", h.handleCreateInvestmentIntention, middleware.Auth(s.GetDB(),
		permissions.PermInvestInProjects,
	))

	// list investment intentions - admins can see all, investors can see their own
	intentions.GET("", h.handleListInvestmentIntentions, middleware.Auth(s.GetDB(),
		permissions.PermInvestInProjects,  // investors can see their own
		permissions.PermManageInvestments, // admins can see all
	))

	// get specific investment intention
	intentions.GET("/:id", h.handleGetInvestmentIntention, middleware.Auth(s.GetDB(),
		permissions.PermInvestInProjects,
		permissions.PermManageInvestments,
	))

	// update investment intention amount - investors only for their own
	intentions.PUT("/:id", h.handleUpdateInvestmentIntention, middleware.Auth(s.GetDB(),
		permissions.PermInvestInProjects,
	))

	// update investment intention status - admins only
	intentions.PUT("/:id/status", h.handleUpdateInvestmentIntentionStatus, middleware.Auth(s.GetDB(),
		permissions.PermManageInvestments,
	))

	// delete investment intention - investors can delete their own, admins can delete any
	intentions.DELETE("/:id", h.handleDeleteInvestmentIntention, middleware.Auth(s.GetDB(),
		permissions.PermInvestInProjects,
		permissions.PermManageInvestments,
	))

	// get project investment summary - anyone with project view permissions
	intentions.GET("/project/:project_id/summary", h.handleGetProjectInvestmentSummary, middleware.Auth(s.GetDB(),
		permissions.PermViewAllProjects,
		permissions.PermSubmitProject,
	))

	// bulk status update for project - admins only
	intentions.PUT("/project/:project_id/bulk-status", h.handleBulkUpdateInvestmentIntentionStatus, middleware.Auth(s.GetDB(),
		permissions.PermManageInvestments,
	))
}
