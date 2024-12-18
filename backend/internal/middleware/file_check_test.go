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

func TestFileCheck(t *testing.T) {
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
		config         FileConfig
		filename       string
		content        []byte
		expectedStatus int
	}{
		{
			name: "valid file",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      1024,
				AllowedTypes: []string{"text/plain"},
			},
			filename:       "test.txt",
			content:       []byte("Hello, World!"),
			expectedStatus: http.StatusOK,
		},
		{
			name: "file too large",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      100,
				AllowedTypes: []string{"text/plain"},
			},
			filename:       "large.txt",
			content:       bytes.Repeat([]byte("a"), 150),
			expectedStatus: http.StatusRequestEntityTooLarge,
		},
		{
			name: "file too small",
			config: FileConfig{
				MinSize:      50,
				MaxSize:      1024,
				AllowedTypes: []string{"text/plain"},
			},
			filename:       "small.txt",
			content:       []byte("tiny"),
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid mime type",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      1024,
				AllowedTypes: []string{"image/jpeg", "image/png"},
			},
			filename:       "test.txt",
			content:       []byte("Hello, World!"),
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _, err := createMultipartRequest(tt.filename, tt.content)
			assert.NoError(t, err)

			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			h := FileCheck(tt.config)(handler)
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

		h := FileCheck(FileConfig{
			MinSize: 5,
			MaxSize: 100,
		})(handler)
		
		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})
} 