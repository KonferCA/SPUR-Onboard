package tests

import (
	"KonferCA/SPUR/common"
	"KonferCA/SPUR/internal/server"
	v1 "KonferCA/SPUR/internal/v1"
	"KonferCA/SPUR/internal/v1/v1_health"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestHealthEndpoints(t *testing.T) {
	setupEnv()
	s, err := server.New()
	require.NoError(t, err)

	v1.SetupRoutes(s)

	e := s.GetEcho()

	common.VERSION = "test"

	t.Run("Health Check Endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		var response v1_health.HealthReport
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Equal(t, "healthy", response.Status)
		require.WithinDuration(t, time.Now(), response.Timestamp, 2*time.Second)

		require.True(t, response.Database.Connected)
		require.Greater(t, response.Database.LatencyMs, float64(0))
		require.Contains(t, response.Database.PostgresVersion, "PostgreSQL")
		require.Empty(t, response.Database.Error)

		require.Equal(t, "test", response.System.Version)
		require.NotEmpty(t, response.System.GoVersion)
		require.Greater(t, response.System.NumGoRoutine, 0)
		require.GreaterOrEqual(t, response.System.MemoryUsage, float64(0))

		require.Len(t, response.Services, 2)

		apiService := response.Services[0]
		require.Equal(t, "API", apiService.Name)
		require.Equal(t, "healthy", apiService.Status)
		require.WithinDuration(t, time.Now(), apiService.LastPing, 2*time.Second)
		require.Equal(t, float64(0), apiService.Latency)
		require.Empty(t, apiService.Message)

		dbService := response.Services[1]
		require.Equal(t, "Database", dbService.Name)
		require.Equal(t, "healthy", dbService.Status)
		require.WithinDuration(t, time.Now(), dbService.LastPing, 2*time.Second)
		require.Greater(t, dbService.Latency, float64(0))
		require.Empty(t, dbService.Message)
	})

	t.Run("Live Check Endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health/live", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		var response map[string]interface{}
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Equal(t, "healthy", response["status"])
		require.Equal(t, "Service is alive", response["message"])
	})

	t.Run("Ready Check Endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health/ready", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		var response map[string]interface{}
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Equal(t, "healthy", response["status"])
		require.Equal(t, "Service is ready", response["message"])
	})

	t.Run("Metrics Endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health/metrics", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		var response v1_health.MetricsResponse
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Equal(t, float64(0), response.CPU.Usage)

		require.Greater(t, response.Memory.Total, uint64(0))
		require.Greater(t, response.Memory.Used, uint64(0))
		require.GreaterOrEqual(t, response.Memory.Free, uint64(0))
		require.Greater(t, response.Memory.UsagePerc, float64(0))
		require.Less(t, response.Memory.UsagePerc, float64(100))

		require.Greater(t, response.Goroutines, 0)
		require.GreaterOrEqual(t, response.Database.AvgLatencyMs, float64(0))
	})

	t.Run("Unhealthy Database Check", func(t *testing.T) {
		db := s.GetDB()
		db.Close()
		defer func() {
			s, err = server.New()
			require.NoError(t, err)
		}()

		req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		require.Equal(t, http.StatusServiceUnavailable, rec.Code)

		var response v1_health.HealthReport
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Equal(t, "unhealthy", response.Status)

		require.False(t, response.Database.Connected)
		require.NotEmpty(t, response.Database.Error)
		require.Empty(t, response.Database.PostgresVersion)

		require.Equal(t, "test", response.System.Version)
		require.NotEmpty(t, response.System.GoVersion)

		require.Len(t, response.Services, 2)
		require.Equal(t, "healthy", response.Services[0].Status)
		require.Equal(t, "unhealthy", response.Services[1].Status)
		require.NotEmpty(t, response.Services[1].Message)
	})

	s.GetDB().Close()
}
