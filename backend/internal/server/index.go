package server

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/storage"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

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

	store, err := storage.NewStorage()
	if err != nil {
		return nil, err
	}

	e := echo.New()

	// set the global error handler for all incoming requests
	e.HTTPErrorHandler = errorHandler

	s := Server{
		DBPool:  pool,
		Echo:    e,
		Storage: store,
	}

	s.setupMiddlewares()
	s.setupRoutes()

	return &s, nil
}

/*
Implement the CoreServer interface GetDB method that simply
returns the current db pool.
*/
func (s *Server) GetDB() *pgxpool.Pool {
	return s.DBPool
}

/*
Implement the CoreServer interface GetQueries method that simply
returns a new instance of the db.Queries struct.
*/
func (s *Server) GetQueries() *db.Queries {
	return db.New(s.DBPool)
}

/*
Implement the CoreServer interface GetStorage method that simply
returns an storage instance.
*/
func (s *Server) GetStorage() *storage.Storage {
	return s.Storage
}

/*
Implement the CoreServer interface GetEcho method that simply
returns the root echo instance.
*/
func (s *Server) GetEcho() *echo.Echo {
	return s.Echo
}

/*
Start the server and binds it to the given port.
*/
func (s *Server) Start(port string) error {
	return s.Echo.Start(fmt.Sprintf(":%s", port))
}
