package server

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStaticFileServing(t *testing.T) {
	// setup test directory structure
	staticDir := "static/dist"
	assetsDir := filepath.Join(staticDir, "assets", "img")
	err := os.MkdirAll(assetsDir, 0755)
	assert.NoError(t, err)
	defer os.RemoveAll("static") // cleanup after test

	// create a test file
	testFile := filepath.Join(assetsDir, "logo.png")
	err = os.WriteFile(testFile, []byte("test content"), 0644)
	assert.NoError(t, err)

	// create index.html
	err = os.WriteFile(filepath.Join(staticDir, "index.html"), []byte("<html>test</html>"), 0644)
	assert.NoError(t, err)

	// setup test server
	s, err := New(true)
	assert.NoError(t, err)

	tests := []struct {
		name         string
		path         string
		expectedCode int
	}{
		{
			name:         "normal asset path",
			path:         "/assets/img/logo.png",
			expectedCode: http.StatusOK,
		},
		{
			name:         "path traversal attempt 1",
			path:         "/assets/../../../etc/passwd",
			expectedCode: http.StatusForbidden,
		},
		{
			name:         "path traversal attempt 2",
			path:         "/assets/%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
			expectedCode: http.StatusForbidden,
		},
		{
			name:         "path traversal attempt 3",
			path:         "/assets/..%2f..%2f..%2fetc%2fpasswd",
			expectedCode: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tt.path, nil)
			rec := httptest.NewRecorder()
			s.echoInstance.ServeHTTP(rec, req)
			assert.Equal(t, tt.expectedCode, rec.Code)
		})
	}
}
