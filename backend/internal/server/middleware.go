package server

import (
	"KonferCA/SPUR/internal/middleware"
)

/*
Setup all the global middlewares used in the server.
*/
func (s *Server) setupMiddlewares() {
	s.Echo.Validator = middleware.NewRequestValidator()

	s.Echo.Use(middleware.RequestID())
	s.Echo.Use(middleware.LoggerMiddleware())
}
