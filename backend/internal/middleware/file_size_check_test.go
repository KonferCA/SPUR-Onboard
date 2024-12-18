package middleware

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestFileSizeCheck(t *testing.T) {
	e := echo.New()
	
	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "success")
	}

	// helper to create multipart request with a file
	createMultipartRequest := func(filename string, content []byte) (*http.Request, *bytes.Buffer, error) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		part, err := writer.CreateFormFile("file", filename)
		if err != nil {
			return nil, nil, err
		}
		part.Write(content)
		writer.Close()

		req := httptest.NewRequest(http.MethodPost, "/", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		req.ContentLength = int64(body.Len())
		return req, body, nil
	}

	tests := []struct {
		name           string
		config         FileSizeConfig
		fileSize       int
		expectedStatus int
	}{
		{
			name: "valid file size",
			config: FileSizeConfig{
				MinSize: 5,
				MaxSize: 1024, // increased to account for form overhead
			},
			fileSize:       50,
			expectedStatus: http.StatusOK,
		},
		{
			name: "file too large",
			config: FileSizeConfig{
				MinSize: 5,
				MaxSize: 100,
			},
			fileSize:       150,
			expectedStatus: http.StatusRequestEntityTooLarge,
		},
		{
			name: "file too small",
			config: FileSizeConfig{
				MinSize: 50,
				MaxSize: 1024,
			},
			fileSize:       10,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// create a file with specified size
			content := make([]byte, tt.fileSize)
			req, body, err := createMultipartRequest("test.txt", content)
			assert.NoError(t, err)

			// log actual size for debugging
			t.Logf("Total request size: %d, File content size: %d", body.Len(), tt.fileSize)

			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// wrap handler with middleware
			h := FileSizeCheck(tt.config)(handler)
			err = h(c)

			if tt.expectedStatus != http.StatusOK {
				he, ok := err.(*echo.HTTPError)
				assert.True(t, ok)
				assert.Equal(t, tt.expectedStatus, he.Code)
			} else {
				assert.NoError(t, err)
			}
		})
	}

	// Test GET request (should skip check)
	t.Run("skip check for GET request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		h := FileSizeCheck(FileSizeConfig{
			MinSize: 5,
			MaxSize: 100,
		})(handler)
		
		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}