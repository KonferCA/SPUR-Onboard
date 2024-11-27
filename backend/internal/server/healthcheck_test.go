package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetSystemInfo(t *testing.T) {
	info := getSystemInfo()

	assert.NotEmpty(t, info.Version)
	assert.NotEmpty(t, info.GoVersion)
	assert.Greater(t, info.NumGoRoutine, 0)
	assert.GreaterOrEqual(t, info.MemoryUsage, 0.0)
}

func TestHealthCheckHandler(t *testing.T) {
	// setup test environment
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres")
	os.Setenv("DB_NAME", "postgres")
	os.Setenv("DB_SSLMODE", "disable")

	// create test server
	s, err := New(true)
	require.NoError(t, err)
	defer s.DBPool.Close()

	tests := []struct {
		name           string
		setupFunc      func(*Server)
		expectedStatus int
		expectedHealth string
	}{
		{
			name:           "healthy_system",
			setupFunc:      nil, // no special setup needed
			expectedStatus: http.StatusOK,
			expectedHealth: "healthy",
		},
		{
			name: "unhealthy_system",
			setupFunc: func(s *Server) {
				s.DBPool.Close()
			},
			expectedStatus: http.StatusServiceUnavailable,
			expectedHealth: "unhealthy",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// setup
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/health", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			if tt.setupFunc != nil {
				tt.setupFunc(s)
			}

			// test
			err := s.handleHealthCheck(c)
			require.NoError(t, err)

			// sssertions
			assert.Equal(t, tt.expectedStatus, rec.Code)

			var response HealthReport
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedHealth, response.Status)
			assert.NotEmpty(t, response.Timestamp)
			assert.NotNil(t, response.System)
			assert.NotNil(t, response.Database)

			if tt.expectedHealth == "unhealthy" {
				assert.False(t, response.Database.Connected)
				assert.NotEmpty(t, response.Database.Error)
			} else {
				assert.True(t, response.Database.Connected)
				assert.NotEmpty(t, response.Database.PostgresVersion)
				assert.GreaterOrEqual(t, response.Database.LatencyMs, 0.0)
			}
		})
	}
}
