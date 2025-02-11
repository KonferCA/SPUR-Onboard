package interfaces

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/storage"
)

/*
 *
 * CoreServer is an interface that defines the methods that a server must implement.
 *
 * Usage:
 * 		- GetDB: returns the database connection pool.
 * 		- GetQueries: returns the database queries.
 * 		- GetStorage: returns the storage instance.
 * 		- GetEcho: returns the echo instance.
 *
 * Example:
 *		func (s *Server) GetDB() *pgxpool.Pool {
 *			return s.DBPool
 *		}
 *
 */
type CoreServer interface {
	GetDB() *pgxpool.Pool
	GetQueries() *db.Queries
	GetStorage() *storage.Storage
	GetEcho() *echo.Echo
}
