package interfaces

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/storage"
)

/*
CoreServer defines the complete set of capabilities required by API versions.
This interface is implemented by the main server struct and provides access
to all core services and dependencies needed across the application.

Usage:
  - Implemented by the main server struct
  - Used by API versioned packages to access core functionality
  - Provides complete access to all server capabilities

Example:

	func SetupRoutes(e *echo.Group, s CoreServer) {
	    // Use s.GetQueries() for database access
	    // Use s.GetStorage() for file operations
	    // etc.
	}
*/
type CoreServer interface {
	GetDB() *pgxpool.Pool
	GetQueries() *db.Queries
	GetStorage() *storage.Storage
	GetAuthLimiter() *middleware.RateLimiter
	GetAPILimiter() *middleware.RateLimiter
	GetEcho() *echo.Echo
}
