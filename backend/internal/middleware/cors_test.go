package middleware

import (
	"KonferCA/SPUR/common"
	"net/http"
	"net/http/httptest"
	"os"
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
			name:                     "Development Environment",
			env:                      "development",
			expectedAllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173", "https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca", "http://localhost:5173"},
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
			expectedAllowHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
			expectedUnsafeWildcard: false,
		},
		{
			name:                     "Test Environment",
			env:                      "test",
			expectedAllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173", "https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca", "http://localhost:5173"},
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
			expectedAllowHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
			expectedUnsafeWildcard: false,
		},
		{
			name:                     "Staging Environment",
			env:                      common.STAGING_ENV,
			expectedAllowOrigins:     []string{"https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca", "https://spuric.com"},
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
			expectedAllowHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
			expectedUnsafeWildcard: false,
		},
		{
			name:                     "Preview Environment",
			env:                      "preview",
			expectedAllowOrigins:     []string{"https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca", "https://spuric.com"},
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
			expectedAllowHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
			expectedUnsafeWildcard: false,
		},
		{
			name:                     "Production Environment (explicit)",
			env:                      "production",
			expectedAllowOrigins:     []string{"", "https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca"},
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
			name:                     "Unknown Environment (should default to production)",
			env:                      "unknown",
			expectedAllowOrigins:     []string{"", "https://spuric.com", "http://spuric.com", "https://konfer.ca", "http://konfer.ca"},
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
	originalFrontendUrlEnv := os.Getenv("FRONTEND_URL")
	defer os.Setenv("FRONTEND_URL", originalFrontendUrlEnv)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment for this test
			os.Setenv("APP_ENV", tt.env)
			os.Setenv("FRONTEND_URL", tt.expectedAllowOrigins[0])

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
		name   string
		env    string
		origin string
		method string
	}{
		{
			name:   "Development Environment - Regular Request",
			env:    "development",
			origin: "http://localhost:3000",
			method: http.MethodGet,
		},
		{
			name:   "Development Environment - Preflight Request",
			env:    "development",
			origin: "http://localhost:3000",
			method: http.MethodOptions,
		},
		{
			name:   "Staging Environment - Regular Request",
			env:    "staging",
			origin: "https://nk-staging.konfer.ca",
			method: http.MethodGet,
		},
		{
			name:   "Staging Environment - Preflight Request",
			env:    "staging",
			origin: "https://nk-staging.konfer.ca",
			method: http.MethodOptions,
		},
		{
			name:   "Production Environment - Regular Request",
			env:    "production",
			origin: "https://spur.konfer.ca",
			method: http.MethodGet,
		},
		{
			name:   "Production Environment - Preflight Request",
			env:    "production",
			origin: "https://spur.konfer.ca",
			method: http.MethodOptions,
		},
	}

	// Store original environment variable
	originalEnv := os.Getenv("APP_ENV")
	defer os.Setenv("APP_ENV", originalEnv)
	originalFrontendUrlEnv := os.Getenv("FRONTEND_URL")
	defer os.Setenv("FRONTEND_URL", originalFrontendUrlEnv)

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			os.Setenv("APP_ENV", tc.env)
			os.Setenv("FRONTEND_URL", tc.origin)
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

			// Verify Vary header includes Origin
			varyHeader := rec.Header().Get("Vary")
			assert.Contains(t, varyHeader, "Origin", "Vary header should contain Origin")

			// Verify response status code
			if tc.method == http.MethodOptions {
				assert.Equal(t, http.StatusNoContent, rec.Code, "Preflight request should return 204 No Content")
			} else {
				assert.Equal(t, http.StatusOK, rec.Code, "Regular request should return 200 OK")
			}
		})
	}
}

func TestGetEnvCORS(t *testing.T) {

	tests := []struct {
		name     string
		envSetup func()
		initial  []string
		expected []string
	}{
		{
			name: "Should included the domains from CORS env",
			envSetup: func() {
				os.Setenv("CORS", "https://test.domain.com;https://test2.domain.com;")
			},
			initial:  []string{},
			expected: []string{"https://test.domain.com", "https://test2.domain.com"},
		},
		{
			name: "Should combine initial and CORS env",
			envSetup: func() {
				os.Setenv("CORS", "https://test.domain.com;https://test2.domain.com;")
			},
			initial:  []string{"https://initial.com"},
			expected: []string{"https://initial.com", "https://test.domain.com", "https://test2.domain.com"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.envSetup()

			result := getEnvCORS(tc.initial)
			assert.Equal(t, len(tc.expected), len(result))
			for _, domain := range tc.expected {
				assert.Contains(t, result, domain)
			}

			// reset
			os.Setenv("CORS", "")
		})
	}
}
