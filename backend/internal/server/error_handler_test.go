package server

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
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
		expectedBody   string
	}{
		{
			name: "http error",
			handler: func(c echo.Context) error {
				return echo.NewHTTPError(http.StatusBadRequest, "bad request")
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"status":400,"message":"bad request"}`,
		},
		{
			name: "generic error",
			handler: func(c echo.Context) error {
				return echo.NewHTTPError(http.StatusInternalServerError, "something went wrong")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   `{"status":500,"message":"something went wrong"}`,
		},
		{
			name: "validation error",
			handler: func(c echo.Context) error {
				type TestStruct struct {
					Email string `validate:"required,email"`
					Age   int    `validate:"required,gt=0"`
				}

				v := validator.New()
				err := v.Struct(TestStruct{
					Email: "invalid-email",
					Age:   -1,
				})

				return err
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody: `{
				"status": 400,
				"message": "validation failed",
				"errors": [
					"Key: 'TestStruct.Email' Error:Field validation for 'Email' failed on the 'email' tag",
					"Key: 'TestStruct.Age' Error:Field validation for 'Age' failed on the 'gt' tag"
				]
			}`,
		},
		{
			name: "with request id",
			handler: func(c echo.Context) error {
				c.Request().Header.Set(echo.HeaderXRequestID, "test-123")
				return echo.NewHTTPError(http.StatusBadRequest, "bad request")
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"status":400,"message":"bad request","request_id":"test-123"}`,
		},
	}

	// run tests
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := tt.handler(c)
			if err != nil {
				e.HTTPErrorHandler(err, c)
			}

			assert.Equal(t, tt.expectedStatus, rec.Code)
			assert.JSONEq(t, tt.expectedBody, rec.Body.String())
		})
	}
}

type logEntry struct {
	Level         string `json:"level"`
	InternalError string `json:"internal_error"`
	RequestError  string `json:"request_error"`
	RequestID     string `json:"request_id"`
	Method        string `json:"method"`
	Path          string `json:"path"`
	Status        int    `json:"status"`
	UserAgent     string `json:"user_agent"`
	Message       string `json:"message"`
}

type customError struct {
	msg string
}

func (e *customError) Error() string {
	return e.msg
}

func TestErrorHandler(t *testing.T) {
	// setting a validation error to not mock anything
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
		name           string
		err            error
		internalErr    error
		expectedStatus int
		expectedMsg    string
	}{
		{
			name:           "internal server error",
			err:            errors.New("something went wrong"),
			expectedStatus: http.StatusInternalServerError,
			expectedMsg:    "internal server error",
		},
		{
			name:           "http error with string message",
			err:            echo.NewHTTPError(http.StatusBadRequest, "invalid input"),
			expectedStatus: http.StatusBadRequest,
			expectedMsg:    "invalid input",
		},
		{
			name:           "http error with non-string message",
			err:            echo.NewHTTPError(http.StatusBadRequest, struct{ foo string }{foo: "bar"}),
			expectedStatus: http.StatusBadRequest,
			expectedMsg:    http.StatusText(http.StatusBadRequest),
		},
		{
			name:           "validation error",
			err:            validationErr,
			expectedStatus: http.StatusBadRequest,
			expectedMsg:    "validation failed",
		},
		{
			name:           "with internal error set",
			err:            errors.New("handler error"),
			internalErr:    errors.New("internal error"),
			expectedStatus: http.StatusInternalServerError,
			expectedMsg:    "internal server error",
		},
	}

	originalLogger := log.Logger
	defer func() {
		log.Logger = originalLogger
	}()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a buffer to capture log output
			var buf bytes.Buffer
			log.Logger = zerolog.New(&buf)

			// Setup Echo context
			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/test", nil)
			req.Header.Set(echo.HeaderXRequestID, "test-request-id")
			req.Header.Set("User-Agent", "test-agent")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// Set internal error if provided
			if tt.internalErr != nil {
				c.Set("internal_error", tt.internalErr)
			}

			// Call error handler
			errorHandler(tt.err, c)

			// Parse log output
			var entry logEntry
			err := json.Unmarshal(buf.Bytes(), &entry)
			assert.NoError(t, err)

			// Verify log fields
			assert.Equal(t, "error", entry.Level)
			assert.Equal(t, "test-request-id", entry.RequestID)
			assert.Equal(t, http.MethodPost, entry.Method)
			assert.Equal(t, "/test", entry.Path)
			assert.Equal(t, tt.expectedStatus, entry.Status)
			assert.Equal(t, "test-agent", entry.UserAgent)
			assert.Equal(t, "request error", entry.Message)

			// Verify error logging
			assert.Contains(t, entry.RequestError, tt.err.Error())
			if tt.internalErr != nil {
				assert.Contains(t, entry.InternalError, tt.internalErr.Error())
			} else if tt.err != nil && !isHTTPError(tt.err) && !isValidationError(tt.err) {
				// If no internal error was set and the error is not HTTP or validation,
				// the handler error should be set as internal error
				assert.Contains(t, entry.InternalError, tt.err.Error())
			}

			// Verify response
			var response ErrorResponse
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, response.Status)
			assert.Equal(t, tt.expectedMsg, response.Message)
			assert.Equal(t, "test-request-id", response.RequestID)

			// Verify validation errors if applicable
			if _, ok := tt.err.(validator.ValidationErrors); ok {
				assert.NotEmpty(t, response.Errors)
			} else {
				assert.Empty(t, response.Errors)
			}
		})
	}
}

// Helper functions to check error types
func isHTTPError(err error) bool {
	_, ok := err.(*echo.HTTPError)
	return ok
}

func isValidationError(err error) bool {
	_, ok := err.(validator.ValidationErrors)
	return ok
}
