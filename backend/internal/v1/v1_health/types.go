package v1_health

import (
	"KonferCA/SPUR/internal/interfaces"
	"time"
)

/*
Main Handler struct for V1 healthcheck routes.
*/
type Handler struct {
	server interfaces.CoreServer
}

/*
DatabaseInfo represents a basic report of a database healthcheck.
*/
type DatabaseInfo struct {
	Connected       bool    `json:"connected"`
	LatencyMs       float64 `json:"latency_ms"`
	PostgresVersion string  `json:"postgres_version,omitempty"`
	Error           string  `json:"error,omitempty"`
}

/*
SystemInfo represents a basic system report for healthcheck.
*/
type SystemInfo struct {
	Version      string  `json:"version"`
	GoVersion    string  `json:"go_version"`
	NumGoRoutine int     `json:"num_goroutines"`
	MemoryUsage  float64 `json:"memory_usage"`
}

/*
HealthReport represents a bundle of different reports for healthcheck.g
*/
type HealthReport struct {
	Status    string       `json:"status"`
	Timestamp time.Time    `json:"timestamp"`
	Database  DatabaseInfo `json:"database"`
	System    SystemInfo   `json:"system"`
}
