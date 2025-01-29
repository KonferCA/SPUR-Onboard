package v1_transactions

import (
	"github.com/labstack/echo/v4"
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
)

func SetupTransactionRoutes(g *echo.Group, s interfaces.CoreServer) {
	h := &Handler{server: s}
	
	// POST /api/v1/transactions
	transactions := g.Group("/transactions")
	transactions.POST("", h.handleCreateTransaction, middleware.Auth(s.GetDB(), 
		permissions.PermInvestInProjects,    // Investors can create transactions
		permissions.PermManageInvestments,   // Admins can manage investments
	))
}
