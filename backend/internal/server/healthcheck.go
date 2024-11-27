package server

import (
	"context"
	"net/http"
	"runtime"
	"time"

	"github.com/labstack/echo/v4"
)

func getSystemInfo() SystemInfo {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	return SystemInfo{
		Version:      "1.0.0",
		GoVersion:    runtime.Version(),
		NumGoRoutine: runtime.NumGoroutine(),
		MemoryUsage:  float64(mem.Alloc) / 1024 / 1024,
	}
}

func checkDatabase(s *Server) DatabaseInfo {
	info := DatabaseInfo{
		Connected: false,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	start := time.Now()

	var version string
	err := s.DBPool.QueryRow(ctx, "SELECT version()").Scan(&version)

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

func (s *Server) handleHealthCheck(c echo.Context) error {
	report := HealthReport{
		Timestamp: time.Now(),
		System:    getSystemInfo(),
	}

	dbInfo := checkDatabase(s)
	report.Database = dbInfo

	if dbInfo.Connected {
		report.Status = "healthy"
	} else {
		report.Status = "unhealthy"
		return c.JSON(http.StatusServiceUnavailable, report)
	}

	return c.JSON(http.StatusOK, report)
}
