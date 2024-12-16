package v1health

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
V1 healthchekc endpoint handler.
*/
func (h *Handler) handleHealthCheck(c echo.Context) error {
	report := HealthReport{
		Timestamp: time.Now(),
		System:    getSystemInfo(),
	}

	dbInfo := checkDatabase(h.server.GetQueries())
	report.Database = dbInfo

	if dbInfo.Connected {
		report.Status = "healthy"
	} else {
		report.Status = "unhealthy"
		return c.JSON(http.StatusServiceUnavailable, report)
	}

	return c.JSON(http.StatusOK, report)
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
