package v1

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/v1/v1_health"
)

func SetupRoutes(s interfaces.CoreServer) {
	e := s.GetEcho()
	g := e.Group("/api/v1")
	v1health.SetupHealthcheckRoutes(g, s)
}
