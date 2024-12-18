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

/*
ErrorResponse represents the response body when a request handlers produces
an error.
*/
type ErrorResponse struct {
	Status    int      `json:"status"`
	Message   string   `json:"message"`
	RequestID string   `json:"request_id,omitempty"`
	Errors    []string `json:"errors,omitempty"`
}
