package middleware

import (
	"KonferCA/SPUR/internal/v1/v1_common"
	"bytes"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestFileCheck(t *testing.T) {
	e := echo.New()

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "success")
	}

	// helper to create multipart request with a file and optional content type
	createMultipartRequest := func(filename string, content []byte, contentType string) (*http.Request, error) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)

		// Create form file with headers
		h := make(textproto.MIMEHeader)
		h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="%s"; filename="%s"`, "file", filename))
		if contentType != "" {
			h.Set("Content-Type", contentType)
		}

		part, err := writer.CreatePart(h)
		if err != nil {
			return nil, err
		}

		part.Write(content)
		writer.Close()

		req := httptest.NewRequest(http.MethodPost, "/", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		req.ContentLength = int64(body.Len())
		return req, nil
	}

	// Sample file contents with proper headers
	jpegHeader := []byte{
		0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
		0x49, 0x46, 0x00, 0x01,
	}
	pngHeader := []byte{
		0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
		0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
	}
	pdfHeader := []byte{
		0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34,
		0x0A, 0x25, 0xC7, 0xEC, 0x8F, 0xA2, 0x0A,
	}

	tests := []struct {
		name           string
		config         FileConfig
		filename       string
		content        []byte
		contentType    string
		expectedStatus int
		expectedError  string
	}{
		{
			name: "valid jpeg with matching content type",
			config: FileConfig{
				MinSize:          3,
				MaxSize:          1024,
				AllowedTypes:     []string{"image/jpeg"},
				StrictValidation: true,
			},
			filename:       "test.jpg",
			content:        append(jpegHeader, []byte("dummy content")...),
			contentType:    "image/jpeg",
			expectedStatus: http.StatusOK,
		},
		{
			name: "valid png without content type header",
			config: FileConfig{
				MinSize:          4,
				MaxSize:          1024,
				AllowedTypes:     []string{"image/png"},
				StrictValidation: false,
			},
			filename:       "test.png",
			content:        append(pngHeader, []byte("dummy content")...),
			expectedStatus: http.StatusOK,
		},
		{
			name: "mismatched content type with strict validation",
			config: FileConfig{
				MinSize:          5,
				MaxSize:          1024,
				AllowedTypes:     []string{"image/jpeg", "image/png"},
				StrictValidation: true,
			},
			filename:       "test.jpg",
			content:        append(pngHeader, []byte("dummy content")...),
			contentType:    "image/jpeg",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "doesn't match actual content type",
		},
		{
			name: "file too large",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      100,
				AllowedTypes: []string{"image/jpeg"},
			},
			filename:       "large.jpg",
			content:        append(jpegHeader, bytes.Repeat([]byte("a"), 150)...),
			contentType:    "image/jpeg",
			expectedStatus: http.StatusRequestEntityTooLarge,
			expectedError:  "file size",
		},
		{
			name: "file too small",
			config: FileConfig{
				MinSize:      50,
				MaxSize:      1024,
				AllowedTypes: []string{"image/jpeg"},
			},
			filename:       "small.jpg",
			content:        append(jpegHeader, []byte("tiny")...),
			contentType:    "image/jpeg",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "below minimum required size",
		},
		{
			name: "wrong mime type",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      1024,
				AllowedTypes: []string{"image/jpeg", "image/png"},
			},
			filename:       "document.pdf",
			content:        append(pdfHeader, []byte("dummy content")...),
			contentType:    "application/pdf",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "file type",
		},
		{
			name: "multiple allowed types",
			config: FileConfig{
				MinSize:      5,
				MaxSize:      1024,
				AllowedTypes: []string{"image/jpeg", "image/png", "application/pdf"},
			},
			filename:       "document.pdf",
			content:        append(pdfHeader, []byte("dummy content")...),
			contentType:    "application/pdf",
			expectedStatus: http.StatusOK,
		},
		{
			name: "strict validation success",
			config: FileConfig{
				MinSize:          5,
				MaxSize:          1024,
				AllowedTypes:     []string{"application/pdf"},
				StrictValidation: true,
			},
			filename:       "document.pdf",
			content:        append(pdfHeader, []byte("dummy content")...),
			contentType:    "application/pdf",
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := createMultipartRequest(tt.filename, tt.content, tt.contentType)
			assert.NoError(t, err)

			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			h := FileCheck(tt.config)(handler)
			err = h(c)

			if tt.expectedStatus != http.StatusOK {
				he, ok := err.(*v1_common.APIError)
				assert.True(t, ok)
				assert.Equal(t, tt.expectedStatus, he.Code)
				if tt.expectedError != "" {
					assert.Contains(t, he.Message, tt.expectedError)
				}
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
