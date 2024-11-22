package server

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestProjectCommentEndpoints(t *testing.T) {
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
	_, err = s.DBPool.Exec(ctx, "DELETE FROM project_comments")
	if err != nil {
		t.Fatalf("failed to clean up project_comments: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM projects")
	if err != nil {
		t.Fatalf("failed to clean up projects: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM companies WHERE name = $1", "Test Company")
	if err != nil {
		t.Fatalf("failed to clean up companies: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up test user: %v", err)
	}

	// Create a test user directly in the database
	userID := uuid.New().String()
	_, err = s.DBPool.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, first_name, last_name, role)
		VALUES ($1, $2, $3, $4, $5, 'startup_owner')
	`, userID, "test@example.com", "hashedpassword", "Test", "User")
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	// Create a company
	description := "Test Company Description"
	companyPayload := CreateCompanyRequest{
		OwnerUserID: userID,
		Name:        "Test Company",
		Description: &description,
	}
	companyBody, _ := json.Marshal(companyPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/companies", bytes.NewReader(companyBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	s.echoInstance.ServeHTTP(rec, req)

	t.Logf("Company creation response: %s", rec.Body.String())

	var companyResponse map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&companyResponse)
	if !assert.NoError(t, err) {
		t.Fatalf("Failed to decode company response: %v", err)
	}

	companyID, ok := companyResponse["ID"].(string)
	if !assert.True(t, ok, "Company ID should be a string") {
		t.Fatalf("Failed to get company ID from response: %v", companyResponse)
	}

	// Create a project
	projectDescription := "Test Description"
	projectPayload := CreateProjectRequest{
		CompanyID:   companyID,
		Title:       "Test Project",
		Description: &projectDescription,
		Status:      "draft",
	}
	projectBody, _ := json.Marshal(projectPayload)

	req = httptest.NewRequest(http.MethodPost, "/api/v1/projects", bytes.NewReader(projectBody))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	s.echoInstance.ServeHTTP(rec, req)

	t.Logf("Project creation response: %s", rec.Body.String())

	var projectResponse map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&projectResponse)
	if !assert.NoError(t, err) {
		t.Fatalf("Failed to decode project response: %v", err)
	}

	projectID, ok := projectResponse["ID"].(string)
	if !assert.True(t, ok, "Project ID should be a string") {
		t.Fatalf("Failed to get project ID from response: %v", projectResponse)
	}

	// test create comment
	t.Run("create comment", func(t *testing.T) {
		commentPayload := CreateProjectCommentRequest{
			UserID:  userID,
			Comment: "This is a test comment",
		}
		body, _ := json.Marshal(commentPayload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects/"+projectID+"/comments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("Create comment response: %s", rec.Body.String())
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Equal(t, projectID, response["ProjectID"])
		assert.Equal(t, commentPayload.Comment, response["Comment"])
	})

	// test list comments
	t.Run("list comments", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID+"/comments", nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("List comments response: %s", rec.Body.String())
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, "This is a test comment", response[0]["Comment"])
	})

	// test delete comment
	t.Run("delete comment", func(t *testing.T) {
		// Get the comment ID from the list response
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID+"/comments", nil)
		rec := httptest.NewRecorder()
		s.echoInstance.ServeHTTP(rec, req)

		var listResponse []map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&listResponse)
		assert.NoError(t, err)
		assert.NotEmpty(t, listResponse)

		commentID := listResponse[0]["ID"].(string)

		// Delete the comment
		req = httptest.NewRequest(http.MethodDelete, "/api/v1/projects/comments/"+commentID, nil)
		rec = httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("Delete comment response: %s", rec.Body.String())
		assert.Equal(t, http.StatusNoContent, rec.Code)

		// Verify deletion
		req = httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID+"/comments", nil)
		rec = httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("List comments after delete response: %s", rec.Body.String())
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Len(t, response, 0, "Comment list should be empty after deletion")
	})

	// test error cases
	t.Run("create comment with invalid project ID", func(t *testing.T) {
		commentPayload := CreateProjectCommentRequest{
			UserID:  userID,
			Comment: "This is a test comment",
		}
		body, _ := json.Marshal(commentPayload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects/invalid-uuid/comments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	t.Run("create comment with invalid user ID", func(t *testing.T) {
		commentPayload := CreateProjectCommentRequest{
			UserID:  "invalid-uuid",
			Comment: "This is a test comment",
		}
		body, _ := json.Marshal(commentPayload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects/"+projectID+"/comments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	t.Run("delete non-existent comment", func(t *testing.T) {
		nonExistentID := uuid.New().String()
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/projects/comments/"+nonExistentID, nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}
