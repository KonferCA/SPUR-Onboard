package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRequestBodyValidator(t *testing.T) {
	type testStruct struct {
		TestField bool `json:"test_field" validate:"required"`
	}

	e := echo.New()
	e.Validator = NewRequestBodyValidator()
	e.POST("/", func(c echo.Context) error {
		// check that the request body is the correct interface
		i, ok := c.Get(REQUEST_BODY_KEY).(*testStruct)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError)
		}

		// echo back
		return c.JSON(http.StatusOK, i)
	}, ValidateRequestBody(reflect.TypeOf(testStruct{})))

	tests := []struct {
		name         string
		payload      interface{}
		expectedCode int
	}{
		{
			name: "Valid request body",
			payload: testStruct{
				TestField: true,
			},
			expectedCode: http.StatusOK,
		},
		{
			name: "Invalid request body - validation error",
			payload: testStruct{
				// will fail required validation
				TestField: false,
			},
			// expecting 500 since the middleware its expected to return
			// the original ValidationErrors from validator pkg
			expectedCode: http.StatusInternalServerError,
		},
		{
			name:    "Empty request body",
			payload: nil,
			// expecting 500 since the middleware its expected to return
			// the original ValidationErrors from validator pkg
			expectedCode: http.StatusInternalServerError,
		},
		{
			name: "Invalid JSON format",
			payload: `{
				"test_field": invalid
			}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name: "Wrong type in JSON",
			payload: map[string]interface{}{
				"test_field": "not a boolean",
			},
			expectedCode: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var req *http.Request

			if tc.payload != nil {
				var payload []byte
				var err error

				// handle string payloads (for invalid JSON tests)
				if strPayload, ok := tc.payload.(string); ok {
					payload = []byte(strPayload)
				} else {
					payload, err = json.Marshal(tc.payload)
					assert.NoError(t, err)
				}

				req = httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(payload))
				req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			} else {
				req = httptest.NewRequest(http.MethodPost, "/", nil)
				req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			}

			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			t.Log(rec.Body.String())
			assert.Equal(t, tc.expectedCode, rec.Code)
		})
	}
}
