package server

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"github.com/labstack/echo/v4"
)

/*
Setup all the global middlewares used in the server.
*/
func (s *Server) setupMiddlewares() {
	s.Echo.Use(middleware.RequestID())
}

// protected is a helper to quickly protect routes with JWT auth
func (s *Server) protected(roles ...db.UserRole) echo.MiddlewareFunc {
	return middleware.Auth(middleware.AuthConfig{
		AcceptTokenType: jwt.ACCESS_TOKEN_TYPE,
		AcceptUserRoles: roles,
	}, s.DBPool)
}
