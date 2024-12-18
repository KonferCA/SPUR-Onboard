package server

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

/*
Setup all the global middlewares used in the server.
*/
func (s *Server) setupMiddlewares() {
	s.Echo.Use(middleware.RequestID())
}