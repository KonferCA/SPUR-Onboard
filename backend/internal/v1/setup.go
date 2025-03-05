package v1

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/v1/v1_auth"
	"KonferCA/SPUR/internal/v1/v1_companies"
	"KonferCA/SPUR/internal/v1/v1_health"
	"KonferCA/SPUR/internal/v1/v1_projects"
	"KonferCA/SPUR/internal/v1/v1_teams"
	"KonferCA/SPUR/internal/v1/v1_transactions"
	"KonferCA/SPUR/internal/v1/v1_users"
)

func SetupRoutes(s interfaces.CoreServer) {
	e := s.GetEcho()
	g := e.Group("/api/v1")

	v1_health.SetupHealthcheckRoutes(g, s)
	v1_auth.SetupAuthRoutes(g, s)
	v1_companies.SetupCompanyRoutes(g, s)
	v1_projects.SetupRoutes(g, s)
	v1_teams.SetupRoutes(g, s)
	v1_transactions.SetupTransactionRoutes(g, s)
	v1_users.SetupUserRoutes(g, s)
}
