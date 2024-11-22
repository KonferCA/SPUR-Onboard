package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGlobalErrorHandler(t *testing.T) {
	// setup
	e := echo.New()
	e.HTTPErrorHandler = globalErrorHandler

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
