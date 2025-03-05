package server

import (
	"KonferCA/SPUR/internal/v1/v1_common"
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestGlobalErrorHandler(t *testing.T) {
	// setup
	e := echo.New()
	e.HTTPErrorHandler = errorHandler

	// test cases
	tests := []struct {
		name           string
		handler        echo.HandlerFunc
		expectedStatus int
		expectedType   v1_common.ErrorType
		expectedMsg    string
	}{
		{
			name: "http error",
			handler: func(c echo.Context) error {
				return echo.NewHTTPError(http.StatusBadRequest, "bad request")
			},
			expectedStatus: http.StatusBadRequest,
			expectedType:   v1_common.ErrorTypeBadRequest,
			expectedMsg:    "bad request",
		},
		{
			name: "generic error",
			handler: func(c echo.Context) error {
				return echo.NewHTTPError(http.StatusInternalServerError, "something went wrong")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedType:   v1_common.ErrorTypeInternal,
			expectedMsg:    "something went wrong",
		},
		{
			name: "validation error",
			handler: func(c echo.Context) error {
				type TestStruct struct {
					Email string `validate:"required,email"`
					Age   int    `validate:"required,gt=0"`
				}

				v := validator.New()
				return v.Struct(TestStruct{
					Email: "invalid-email",
					Age:   -1,
				})
			},
			expectedStatus: http.StatusBadRequest,
			expectedType:   v1_common.ErrorTypeValidation,
			expectedMsg:    "validation failed",
		},
		{
			name: "with request id",
			handler: func(c echo.Context) error {
				c.Request().Header.Set(echo.HeaderXRequestID, "test-123")
				return echo.NewHTTPError(http.StatusBadRequest, "bad request")
			},
			expectedStatus: http.StatusBadRequest,
			expectedType:   v1_common.ErrorTypeBadRequest,
			expectedMsg:    "bad request",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := tt.handler(c)
			if err != nil {
				e.HTTPErrorHandler(err, c)
			}

			var response v1_common.APIError
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, rec.Code)
			assert.Equal(t, tt.expectedType, response.Type)
			assert.Equal(t, tt.expectedMsg, response.Message)
		})
	}
}

type logEntry struct {
	Level         string              `json:"level"`
	InternalError error               `json:"internal_error,omitempty"`
	RequestError  string              `json:"request_error"`
	RequestID     string              `json:"request_id"`
	Method        string              `json:"method"`
	Path          string              `json:"path"`
	Status        int                 `json:"status"`
	UserAgent     string              `json:"user_agent"`
	Message       string              `json:"message"`
	Code          int                 `json:"code"`
	Type          v1_common.ErrorType `json:"type"`
}

func TestErrorHandler(t *testing.T) {
	originalLogger := log.Logger

	defer func() {
		log.Logger = originalLogger
	}()

	type TestStruct struct {
		Email string `validate:"required,email"`
		Age   int    `validate:"required,gt=0"`
	}

	v := validator.New()
	validationErr := v.Struct(TestStruct{
		Email: "invalid-email",
		Age:   -1,
	})

	tests := []struct {
		name             string
		err              error
		internalErr      error
		expectedStatus   int
		expectedType     v1_common.ErrorType
		expectedMsg      string
		expectedDetails  interface{}
		checkLoggedError bool
	}{
		{
			name:             "internal server error",
			err:              errors.New("something went wrong"),
			expectedStatus:   http.StatusInternalServerError,
			expectedType:     v1_common.ErrorTypeInternal,
			expectedMsg:      "internal server error",
			expectedDetails:  "an unexpected error occurred. please try again later",
			checkLoggedError: true,
		},
		{
			name:             "http error with string message",
			err:              echo.NewHTTPError(http.StatusBadRequest, "invalid input"),
			expectedStatus:   http.StatusBadRequest,
			expectedType:     v1_common.ErrorTypeBadRequest,
			expectedMsg:      "invalid input",
			expectedDetails:  "",
			checkLoggedError: false,
		},
		{
			name:             "http error with non-string message",
			err:              echo.NewHTTPError(http.StatusBadRequest, struct{ foo string }{foo: "bar"}),
			expectedStatus:   http.StatusBadRequest,
			expectedType:     v1_common.ErrorTypeBadRequest,
			expectedMsg:      http.StatusText(http.StatusBadRequest),
			expectedDetails:  "",
			checkLoggedError: false,
		},
		{
			name:           "validation error",
			err:            validationErr,
			expectedStatus: http.StatusBadRequest,
			expectedType:   v1_common.ErrorTypeValidation,
			expectedMsg:    "validation failed",
			expectedDetails: map[string]map[string]interface{}{
				"email": {
					"tag":       "email",
					"value":     "invalid-email",
					"condition": "",
				},
				"age": {
					"tag":       "gt",
					"value":     float64(-1),
					"condition": "0",
				},
			},
			checkLoggedError: false,
		},
		{
			name:             "with internal error set",
			err:              errors.New("handler error"),
			internalErr:      errors.New("internal error"),
			expectedStatus:   http.StatusInternalServerError,
			expectedType:     v1_common.ErrorTypeInternal,
			expectedMsg:      "internal server error",
			expectedDetails:  "an unexpected error occurred. please try again later",
			checkLoggedError: true,
		},
		{
			name:             "api error",
			err:              &v1_common.APIError{Type: v1_common.ErrorTypeAuth, Message: "unauthorized", Code: http.StatusUnauthorized},
			expectedStatus:   http.StatusUnauthorized,
			expectedType:     v1_common.ErrorTypeAuth,
			expectedMsg:      "unauthorized",
			expectedDetails:  "",
			checkLoggedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			log.Logger = zerolog.New(&buf)

			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/test", nil)
			req.Header.Set(echo.HeaderXRequestID, "test-request-id")
			req.Header.Set("User-Agent", "test-agent")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			if tt.internalErr != nil {
				c.Set("internal_error", tt.internalErr)
			}

			// call error handler and verify it returns no error
			errorHandler(tt.err, c)

			// verify status was set correctly
			assert.Equal(t, tt.expectedStatus, rec.Result().StatusCode, "Status code mismatch")

			// check response
			var response v1_common.APIError
			err := json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, response.Code, "Response code mismatch")
			assert.Equal(t, tt.expectedType, response.Type, "Error type mismatch")
			assert.Equal(t, tt.expectedMsg, response.Message, "Error message mismatch")
			assert.Equal(t, "test-request-id", response.RequestID, "Request ID mismatch")
			if tt.expectedType == v1_common.ErrorTypeValidation {
				var detailsMap map[string]map[string]interface{}
				err = json.Unmarshal([]byte(response.Details), &detailsMap)
				assert.NoError(t, err, "Failed to parse validation details as JSON")
				assert.Equal(t, tt.expectedDetails, detailsMap, "Validation details mismatch")
			} else {
				assert.Equal(t, tt.expectedDetails, response.Details, "Details mismatch")
			}

			// verify log entry
			logLines := strings.Split(strings.TrimSpace(buf.String()), "\n")
			var logEntry struct {
				Level   string `json:"level"`
				ReqErr  string `json:"request_error"`
				Status  int    `json:"status"`
				Message string `json:"message"`
				Error   string `json:"error,omitempty"`
			}

			if len(logLines) > 0 {
				lastLine := logLines[len(logLines)-1]
				err = json.Unmarshal([]byte(lastLine), &logEntry)
				assert.NoError(t, err, "Failed to parse log entry")

				assert.Equal(t, "error", logEntry.Level, "Log level mismatch")
				assert.Equal(t, tt.expectedStatus, logEntry.Status, "Log status mismatch")

				if tt.checkLoggedError {
					assert.NotEmpty(t, logEntry.Error, "Expected error to be logged")
				}
			}
		})
	}
}
