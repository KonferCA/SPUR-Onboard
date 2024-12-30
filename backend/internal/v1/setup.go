package v1

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/v1/v1_auth"
	"KonferCA/SPUR/internal/v1/v1_companies"
	"KonferCA/SPUR/internal/v1/v1_health"
)

func SetupRoutes(s interfaces.CoreServer) {
	e := s.GetEcho()
	g := e.Group("/api/v1")

	v1_health.SetupHealthcheckRoutes(g, s)
	v1_auth.SetupAuthRoutes(g, s)
	v1_companies.SetupCompanyRoutes(g, s)
}
