package server

import (
	"KonferCA/SPUR/storage"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

type Server struct {
	DBPool  *pgxpool.Pool
	Echo    *echo.Echo
	Storage *storage.Storage
}
