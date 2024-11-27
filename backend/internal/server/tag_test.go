package server

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTagEndpoints(t *testing.T) {
	// setup test environment
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres")
	os.Setenv("DB_NAME", "postgres")
	os.Setenv("DB_SSLMODE", "disable")

	// create server
	s, err := New(true)
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	defer s.DBPool.Close()

	// clean up database before tests
	ctx := context.Background()
	_, err = s.DBPool.Exec(ctx, "DELETE FROM tags WHERE name = $1", "test-tag")
	if err != nil {
		t.Fatalf("failed to clean up database: %v", err)
	}

	// test create tag
	t.Run("create tag", func(t *testing.T) {
		payload := CreateTagRequest{
			Name: "test-tag",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/tags", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Contains(t, response, "ID")
		assert.Contains(t, response, "Name")

		tagID := response["ID"].(string)
		assert.NotEmpty(t, tagID)
		assert.Equal(t, payload.Name, response["Name"])

		// test get tag
		t.Run("get tag", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/tags/"+tagID, nil)
			rec := httptest.NewRecorder()

			s.echoInstance.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			var getResponse map[string]interface{}
			err := json.NewDecoder(rec.Body).Decode(&getResponse)
			assert.NoError(t, err)
			assert.Equal(t, tagID, getResponse["ID"])
			assert.Equal(t, payload.Name, getResponse["Name"])
		})

		// test list tags
		t.Run("list tags", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/tags", nil)
			rec := httptest.NewRecorder()

			s.echoInstance.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			var listResponse []map[string]interface{}
			err := json.NewDecoder(rec.Body).Decode(&listResponse)
			assert.NoError(t, err)
			assert.NotEmpty(t, listResponse)
		})

		// test delete tag
		t.Run("delete tag", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, "/api/v1/tags/"+tagID, nil)
			rec := httptest.NewRecorder()

			s.echoInstance.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusNoContent, rec.Code)

			// verify deletion using database query
			var count int
			err := s.DBPool.QueryRow(context.Background(), "SELECT COUNT(*) FROM tags WHERE id = $1", tagID).Scan(&count)
			assert.NoError(t, err)
			assert.Equal(t, 0, count, "Tag should be deleted from database")
		})
	})

	// test validation errors
	t.Run("validation errors", func(t *testing.T) {
		payload := CreateTagRequest{
			Name: "", // empty name should fail validation
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/tags", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	// test invalid uuid
	t.Run("invalid uuid", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/tags/invalid-uuid", nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}
