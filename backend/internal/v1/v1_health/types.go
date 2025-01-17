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
ServiceStatus represents a basic report of an external service healthcheck.
*/
type ServiceStatus struct {
	Name     string    `json:"name"`
	Status   string    `json:"status"`
	LastPing time.Time `json:"last_ping"`
	Latency  float64   `json:"latency_ms"`
	Message  string    `json:"message,omitempty"`
}

/*
HealthReport represents the full healthcheck report.
*/
type HealthReport struct {
	Status    string          `json:"status"`
	Timestamp time.Time       `json:"timestamp"`
	Database  DatabaseInfo    `json:"database"`
	System    SystemInfo      `json:"system"`
	Services  []ServiceStatus `json:"services"`
}

/*
MetricsResponnse represents the response for all the metrics of the backend.
*/
type MetricsResponse struct {
	CPU struct {
		Usage float64 `json:"usage"`
	} `json:"cpu"`
	Memory struct {
		Total     uint64  `json:"total"`
		Used      uint64  `json:"used"`
		Free      uint64  `json:"free"`
		UsagePerc float64 `json:"usage_percentage"`
	} `json:"memory"`
	Goroutines int     `json:"goroutines"`
	Uptime     float64 `json:"uptime_hours"`
	Database   struct {
		ConnectionCount int     `json:"connection_count"`
		AvgLatencyMs    float64 `json:"avg_latency_ms"`
	} `json:"database"`
}
