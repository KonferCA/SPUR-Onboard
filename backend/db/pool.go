package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Creates a new database connection pool using pgx/v5 driver.
//
// Default pool configuration:
// max conns = 25;
// min conns = 5;
// max conn life time = 1 hour;
// max conn idle time = 30 minutes;
//
// Example:
//
// connStr := "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s"
//
// conn, err := db.NewPool(connStr)
func NewPool(connStr string) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse connection string: %w", err)
	}

	// defaults for pool
	poolConfig.MaxConns = 25
	poolConfig.MinConns = 5
	poolConfig.MaxConnLifetime = time.Hour
	poolConfig.MaxConnIdleTime = 30 * time.Minute

	// create context with timeout to not hang the startup of the
	// server if the database is not responding.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// clean up
	defer cancel()

	// create pool
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	// make sure connection has successfully been established
	err = pool.Ping(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	return pool, nil
}
