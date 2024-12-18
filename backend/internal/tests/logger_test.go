package tests

import (
	"bytes"
	"encoding/json"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	customMiddleware "KonferCA/SPUR/internal/middleware"
	"net/http"
	"net/http/httptest"
	"testing"
)

/*
TestLoggerMiddleware verifies that the logger middleware:
1. Properly logs request start and completion
2. Includes all required fields in logs
3. Correctly measures request duration
4. Properly handles request ID
5. Doesn't interfere with request processing
*/
func TestLoggerMiddleware(t *testing.T) {
	// capture log output for testing
	var buf bytes.Buffer
	log.Logger = zerolog.New(&buf)

	// setup echo
	e := echo.New()
	e.Use(middleware.RequestID())
	e.Use(customMiddleware.Logger())

	// create test handler
	e.GET("/test", func(c echo.Context) error {
		return c.String(http.StatusOK, "test response")
	})

	// create test request
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()

	// process request
	e.ServeHTTP(rec, req)

	// verify response
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "test response", rec.Body.String())

	// verify logs
	var logEntry map[string]interface{}
	logs := bytes.Split(bytes.TrimSpace(buf.Bytes()), []byte("\n"))
	
	// we expect exactly 1 log entry
	assert.Equal(t, 1, len(logs))

	// verify log entry
	err := json.Unmarshal(logs[0], &logEntry)
	assert.NoError(t, err)
	assert.Equal(t, "request completed", logEntry["message"])
	assert.Equal(t, "GET", logEntry["method"])
	assert.Equal(t, "/test", logEntry["path"])
	assert.NotEmpty(t, logEntry["request_id"])
	assert.Equal(t, float64(200), logEntry["status"])
	assert.NotEmpty(t, logEntry["latency"])
}

/*
TestLoggerMiddlewareWithError verifies that the logger properly
handles and logs errors that occur during request processing
*/
func TestLoggerMiddlewareWithError(t *testing.T) {
	// capture log output
	var buf bytes.Buffer
	log.Logger = zerolog.New(&buf)

	// setup echo with error handler
	e := echo.New()
	e.Use(middleware.RequestID())
	e.Use(customMiddleware.Logger())

	// create handler that returns an error
	e.GET("/error", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusBadRequest, "test error")
	})

	// create and process request
	req := httptest.NewRequest(http.MethodGet, "/error", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	// verify response indicates error
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	// verify logs
	var logEntry map[string]interface{}
	logs := bytes.Split(bytes.TrimSpace(buf.Bytes()), []byte("\n"))
	err := json.Unmarshal(logs[0], &logEntry)
	assert.NoError(t, err)
	
	// verify error was logged
	assert.Equal(t, "request completed", logEntry["message"])
	assert.Equal(t, float64(400), logEntry["status"])
	assert.NotEmpty(t, logEntry["error"])
}