package server

import (
	"KonferCA/SPUR/storage"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

type Server struct {
	DBPool  *pgxpool.Pool
	Echo    *echo.Echo
	Storage *storage.Storage
}

type DatabaseInfo struct {
	Connected       bool    `json:"connected"`
	LatencyMs       float64 `json:"latency_ms"`
	PostgresVersion string  `json:"postgres_version,omitempty"`
	Error           string  `json:"error,omitempty"`
}

type SystemInfo struct {
	Version      string  `json:"version"`
	GoVersion    string  `json:"go_version"`
	NumGoRoutine int     `json:"num_goroutines"`
	MemoryUsage  float64 `json:"memory_usage"`
}

type HealthReport struct {
	Status    string       `json:"status"`
	Timestamp time.Time    `json:"timestamp"`
	Database  DatabaseInfo `json:"database"`
	System    SystemInfo   `json:"system"`
}
