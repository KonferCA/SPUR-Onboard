package v1_health

import (
	"KonferCA/SPUR/common"
	"KonferCA/SPUR/db"
	"context"
	"net/http"
	"runtime"
	"time"

	"github.com/labstack/echo/v4"
)

/*
V1 healthcheck endpoint handler.
*/
func (h *Handler) handleHealthCheck(c echo.Context) error {
	report := HealthReport{
		Status:    "healthy",
		Timestamp: time.Now(),
		System:    getSystemInfo(),
	}

	dbInfo := checkDatabase(h.server.GetQueries())
	report.Database = dbInfo

	dbStatus := "unhealthy"
	if dbInfo.Connected {
		dbStatus = "healthy"
	}

	report.Services = []ServiceStatus{
		{
			Name:     "API",
			Status:   "healthy",
			LastPing: time.Now(),
			Latency:  0,
		},
		{
			Name:     "Database",
			Status:   dbStatus,
			LastPing: time.Now(),
			Latency:  dbInfo.LatencyMs,
			Message:  dbInfo.Error,
		},
	}

	report.Status = determineOverallStatus(report)

	if report.Status == "unhealthy" {
		return c.JSON(http.StatusServiceUnavailable, report)
	}

	return c.JSON(http.StatusOK, report)
}

/*
handleLiveCheck is a handler function that checks if the service is alive.
*/
func (h *Handler) handleLiveCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":  "healthy",
		"message": "Service is alive",
	})
}

/*
handleReadyCheck is a handler function that checks if the service is ready to serve requests.
*/
func (h *Handler) handleReadyCheck(c echo.Context) error {
	dbInfo := checkDatabase(h.server.GetQueries())
	if !dbInfo.Connected {
		return c.JSON(http.StatusServiceUnavailable, map[string]interface{}{
			"status":  "unhealthy",
			"message": "Database not ready",
			"error":   dbInfo.Error,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":  "healthy",
		"message": "Service is ready",
	})
}

/*
handleMetrics is a handler function that returns the metrics of the backend.
*/
func (h *Handler) handleMetrics(c echo.Context) error {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	metrics := MetricsResponse{
		CPU: struct {
			Usage float64 `json:"usage"`
		}{
			Usage: 0, // TODO: implement actual CPU usage
		},
		Memory: struct {
			Total     uint64  `json:"total"`
			Used      uint64  `json:"used"`
			Free      uint64  `json:"free"`
			UsagePerc float64 `json:"usage_percentage"`
		}{
			Total:     mem.TotalAlloc,
			Used:      mem.Alloc,
			Free:      mem.Sys - mem.Alloc,
			UsagePerc: float64(mem.Alloc) / float64(mem.Sys) * 100,
		},
		Goroutines: runtime.NumGoroutine(),
		Database: struct {
			ConnectionCount int     `json:"connection_count"`
			AvgLatencyMs    float64 `json:"avg_latency_ms"`
		}{
			AvgLatencyMs: checkDatabase(h.server.GetQueries()).LatencyMs,
		},
	}

	return c.JSON(http.StatusOK, metrics)
}

/*
getSystemInfo is a helper function that gathers basic information about
the backend which includes backend version, go binary version, number of active go routines and memory usage.
*/
func getSystemInfo() SystemInfo {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	return SystemInfo{
		Version:      common.VERSION,
		GoVersion:    runtime.Version(),
		NumGoRoutine: runtime.NumGoroutine(),
		MemoryUsage:  float64(mem.Alloc) / 1024 / 1024,
	}
}

/*
checkDatabase is a helper function that gathers healthcheck information
on the database including connection status, latency, version, and errors.
*/
func checkDatabase(queries *db.Queries) DatabaseInfo {
	info := DatabaseInfo{
		Connected: false,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	start := time.Now()

	version, err := queries.GetDBVersion(ctx)

	latency := time.Since(start)
	info.LatencyMs = float64(latency.Microseconds()) / 1000.0

	if err != nil {
		info.Connected = false
		info.Error = err.Error()

		return info
	}

	info.Connected = true
	info.PostgresVersion = version

	return info
}

/*
determineOverallStatus is a helper function that determines the overall status of the healthcheck report based on the status of the database and services.
*/
func determineOverallStatus(report HealthReport) string {
	if !report.Database.Connected {
		return "unhealthy"
	}

	hasUnhealthy := false
	hasDegraded := false

	for _, service := range report.Services {
		switch service.Status {
		case "unhealthy":
			hasUnhealthy = true
		case "degraded":
			hasDegraded = true
		}
	}

	if hasUnhealthy {
		return "unhealthy"
	}
	if hasDegraded {
		return "degraded"
	}

	return "healthy"
}
