package middleware

import (
	"KonferCA/SPUR/common"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGetCORSConfigByEnv(t *testing.T) {
	tests := []struct {
		name                     string
		env                      string
		expectedAllowOrigins     []string
		expectedAllowCredentials bool
		expectedAllowMethods     []string
		expectedAllowHeaders     []string
		expectedUnsafeWildcard   bool
	}{
		{
			name: "Development Environment",
			env:  common.DEVELOPMENT_ENV,
			expectedAllowOrigins: []string{
				"*",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: true,
		},
		{
			name: "Test Environment",
			env:  common.TEST_ENV,
			expectedAllowOrigins: []string{
				"*",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: true,
		},
		{
			name: "Staging Environment",
			env:  common.STAGING_ENV,
			expectedAllowOrigins: []string{
				"https://nk-staging.konfer.ca",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: false,
		},
		{
			name: "Preview Environment",
			env:  common.PREVIEW_ENV,
			expectedAllowOrigins: []string{
				"https://nk-dev.konfer.ca",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: false,
		},
		{
			name: "Production Environment (explicit)",
			env:  common.PRODUCTION_ENV,
			expectedAllowOrigins: []string{
				"https://spur.konfer.ca",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: false,
		},
		{
			name: "Unknown Environment (should default to production)",
			env:  "unknown",
			expectedAllowOrigins: []string{
				"https://spur.konfer.ca",
			},
			expectedAllowCredentials: true,
			expectedAllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			expectedAllowHeaders:   []string{"*"},
			expectedUnsafeWildcard: false,
		},
	}

	// Store original environment variable
	originalEnv := os.Getenv("APP_ENV")
	defer os.Setenv("APP_ENV", originalEnv)
	originalBackenUrlEnv := os.Getenv("BACKEND_URL")
	defer os.Setenv("BACKEND_URL", originalBackenUrlEnv)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment for this test
			os.Setenv("APP_ENV", tt.env)
			os.Setenv("BACKEND_URL", tt.expectedAllowOrigins[0])

			config := getCORSConfigByEnv()

			// Assert CORS configuration matches expected values
			assert.Equal(t, tt.expectedAllowOrigins, config.AllowOrigins)
			assert.Equal(t, tt.expectedAllowCredentials, config.AllowCredentials)
			assert.Equal(t, tt.expectedAllowMethods, config.AllowMethods)
			assert.Equal(t, tt.expectedAllowHeaders, config.AllowHeaders)
			assert.Equal(t, tt.expectedUnsafeWildcard, config.UnsafeWildcardOriginWithAllowCredentials)
		})
	}
}

func TestCORSIntegration(t *testing.T) {
	testCases := []struct {
		name                     string
		env                      string
		origin                   string
		expectedOrigin           string
		method                   string
		expectedAllowMethods     string
		expectedAllowHeaders     string
		expectedExposeHeaders    string
		expectedMaxAge           string
		expectedAllowCredentials string
	}{
		{
			name:                     "Development Environment - Regular Request",
			env:                      common.DEVELOPMENT_ENV,
			origin:                   "http://localhost:3000",
			expectedOrigin:           "http://localhost:3000",
			method:                   http.MethodGet,
			expectedAllowCredentials: "true",
		},
		{
			name:                     "Development Environment - Preflight Request",
			env:                      common.DEVELOPMENT_ENV,
			origin:                   "http://localhost:3000",
			expectedOrigin:           "http://localhost:3000",
			method:                   http.MethodOptions,
			expectedAllowMethods:     "GET,POST,HEAD,PUT,PATCH,DELETE,OPTIONS",
			expectedAllowHeaders:     "*",
			expectedAllowCredentials: "true",
		},
		{
			name:                     "Staging Environment - Regular Request",
			env:                      common.STAGING_ENV,
			origin:                   "https://nk-staging.konfer.ca",
			expectedOrigin:           "https://nk-staging.konfer.ca",
			method:                   http.MethodGet,
			expectedAllowCredentials: "true",
		},
		{
			name:                     "Staging Environment - Preflight Request",
			env:                      common.STAGING_ENV,
			origin:                   "https://nk-staging.konfer.ca",
			expectedOrigin:           "https://nk-staging.konfer.ca",
			method:                   http.MethodOptions,
			expectedAllowMethods:     "GET,POST,HEAD,PUT,PATCH,DELETE,OPTIONS",
			expectedAllowHeaders:     "*",
			expectedAllowCredentials: "true",
		},
		{
			name:                     "Production Environment - Regular Request",
			env:                      common.PRODUCTION_ENV,
			origin:                   "https://spur.konfer.ca",
			expectedOrigin:           "https://spur.konfer.ca",
			method:                   http.MethodGet,
			expectedAllowCredentials: "true",
		},
		{
			name:                     "Production Environment - Preflight Request",
			env:                      common.PRODUCTION_ENV,
			origin:                   "https://spur.konfer.ca",
			expectedOrigin:           "https://spur.konfer.ca",
			method:                   http.MethodOptions,
			expectedAllowMethods:     "GET,POST,HEAD,PUT,PATCH,DELETE,OPTIONS",
			expectedAllowHeaders:     "*",
			expectedAllowCredentials: "true",
		},
	}

	// Store original environment variable
	originalEnv := os.Getenv("APP_ENV")
	defer os.Setenv("APP_ENV", originalEnv)
	originalBackenUrlEnv := os.Getenv("BACKEND_URL")
	defer os.Setenv("BACKEND_URL", originalBackenUrlEnv)

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			os.Setenv("APP_ENV", tc.env)
			os.Setenv("BACKEND_URL", tc.origin)
			e := echo.New()
			cors := CORS()

			// Create a test request
			req := httptest.NewRequest(tc.method, "/test", nil)
			rec := httptest.NewRecorder()

			req.Header.Set("Origin", tc.origin)

			// Add preflight specific headers if it's an OPTIONS request
			if tc.method == http.MethodOptions {
				req.Header.Set("Access-Control-Request-Method", "GET")
				req.Header.Set("Access-Control-Request-Headers", "content-type")
			}

			c := e.NewContext(req, rec)
			err := cors(func(c echo.Context) error {
				return c.NoContent(http.StatusOK)
			})(c)
			assert.NoError(t, err)

			// Assert common CORS headers
			assert.Equal(t, tc.expectedOrigin, rec.Header().Get("Access-Control-Allow-Origin"), "Allow-Origin header mismatch")
			assert.Equal(t, tc.expectedAllowCredentials, rec.Header().Get("Access-Control-Allow-Credentials"), "Allow-Credentials header mismatch")

			// Assert preflight specific headers for OPTIONS requests
			if tc.method == http.MethodOptions {
				// Verify Allow-Methods (order independent)
				actualMethods := strings.Split(rec.Header().Get("Access-Control-Allow-Methods"), ",")
				expectedMethods := strings.Split(tc.expectedAllowMethods, ",")
				assert.ElementsMatch(t, expectedMethods, actualMethods, "Allow-Methods header mismatch")

				assert.Equal(t, tc.expectedAllowHeaders, rec.Header().Get("Access-Control-Allow-Headers"), "Allow-Headers header mismatch")
				assert.Equal(t, tc.expectedMaxAge, rec.Header().Get("Access-Control-Max-Age"), "Max-Age header mismatch")
			}

			// Verify response status code
			if tc.method == http.MethodOptions {
				assert.Equal(t, http.StatusNoContent, rec.Code, "Preflight request should return 204 No Content")
			} else {
				assert.Equal(t, http.StatusOK, rec.Code, "Regular request should return 200 OK")
			}

			// Verify Vary header includes Origin
			varyHeader := rec.Header().Get("Vary")
			assert.Contains(t, varyHeader, "Origin", "Vary header should contain Origin")
		})
	}
}
