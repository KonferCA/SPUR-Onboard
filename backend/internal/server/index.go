package server

import (
	"KonferCA/SPUR/db"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

type Server struct {
	DBPool *pgxpool.Pool
	Echo   *echo.Echo
}

/*
Initializes a new Server instance and creates a connection pool to the database.
The database connection string can be controlled by setting the following env variables:

DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME DB_SSLMODE
*/
func New() (*Server, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)
	pool, err := db.NewPool(connStr)
	if err != nil {
		return nil, err
	}

	e := echo.New()

	s := Server{
		DBPool: pool,
		Echo:   e,
	}

	s.setupMiddlewares()
	s.setupRoutes()

	return &s, nil
}

/*
Start the server and binds it to the given port.
*/
func (s *Server) Start(port int) error {
	return s.Echo.Start(fmt.Sprintf(":%d", port))
}
