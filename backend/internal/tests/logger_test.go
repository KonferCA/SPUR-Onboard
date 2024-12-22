package tests

import (
	customMiddleware "KonferCA/SPUR/internal/middleware"
	"bytes"
	"encoding/json"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

/*
TestLogger verifies that the logger middleware:
1. Properly creates and stores logger in context
2. Includes request context in all log entries
3. Provides working Info/Error/Warn methods
4. Returns default logger when context is empty
*/
func TestLogger(t *testing.T) {
	// capture log output for testing
	originalLogger := log.Logger
	defer func() { log.Logger = originalLogger }()
	var buf bytes.Buffer
	originalLogger := log.Logger
	defer func() {
		log.Logger = originalLogger
	}()
	log.Logger = zerolog.New(&buf)

	// setup echo
	e := echo.New()

	// setup request ID middleware with a config that ensures ID generation
	e.Use(middleware.RequestIDWithConfig(middleware.RequestIDConfig{
		Generator: func() string {
			return "test-request-id"
		},
	}))
	e.Use(customMiddleware.LoggerMiddleware())

	// create test handler that uses our logger
	e.GET("/test", func(c echo.Context) error {
		logger := customMiddleware.GetLogger(c)
		logger.Info("test info message")
		logger.Warn("test warning")
		logger.Error(echo.NewHTTPError(400, "test error"), "test error message")
		return c.String(http.StatusOK, "test response")
	})

	// create and process request
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	// verify response
	assert.Equal(t, http.StatusOK, rec.Code)

	// verify logs
	logs := bytes.Split(bytes.TrimSpace(buf.Bytes()), []byte("\n"))
	assert.Equal(t, 3, len(logs), "should have 3 log entries")

	// verify each log entry
	var logEntry map[string]interface{}

	// check info log
	err := json.Unmarshal(logs[0], &logEntry)
	assert.NoError(t, err)
	assert.Equal(t, "info", logEntry["level"])
	assert.Equal(t, "test info message", logEntry["message"])
	assert.Equal(t, "test-request-id", logEntry["request_id"])
	assert.Equal(t, "/test", logEntry["path"])

	// check warning log
	err = json.Unmarshal(logs[1], &logEntry)
	assert.NoError(t, err)
	assert.Equal(t, "warn", logEntry["level"])
	assert.Equal(t, "test warning", logEntry["message"])
	assert.Equal(t, "test-request-id", logEntry["request_id"])

	// check error log
	err = json.Unmarshal(logs[2], &logEntry)
	assert.NoError(t, err)
	assert.Equal(t, "error", logEntry["level"])
	assert.Equal(t, "test error message", logEntry["message"])
	assert.Equal(t, "test-request-id", logEntry["request_id"])
	assert.NotEmpty(t, logEntry["error"])
}

/*
TestLoggerWithoutContext verifies that GetLogger returns
a default logger when called without proper context
*/
func TestLoggerWithoutContext(t *testing.T) {
	originalLogger := log.Logger
	defer func() { log.Logger = originalLogger }()
	var buf bytes.Buffer
	originalLogger := log.Logger
	defer func() {
		log.Logger = originalLogger
	}()
	log.Logger = zerolog.New(&buf)

	e := echo.New()
	c := e.NewContext(nil, nil)

	logger := customMiddleware.GetLogger(c)
	assert.NotNil(t, logger, "should return default logger")

	logger.Info("test message")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)
	assert.Equal(t, "test message", logEntry["message"])
}

