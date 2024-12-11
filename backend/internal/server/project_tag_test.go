package server

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"KonferCA/SPUR/internal/jwt"
)

func TestProjectTagEndpoints(t *testing.T) {
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
	_, err = s.DBPool.Exec(ctx, "DELETE FROM project_tags")
	if err != nil {
		t.Fatalf("failed to clean up project_tags: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM projects")
	if err != nil {
		t.Fatalf("failed to clean up projects: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM tags WHERE name = $1", "test-tag")
	if err != nil {
		t.Fatalf("failed to clean up tags: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM companies WHERE name = $1", "Test Company")
	if err != nil {
		t.Fatalf("failed to clean up companies: %v", err)
	}
	_, err = s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up users: %v", err)
	}

	// Create a test user directly in the database
	userID := uuid.New().String()
	_, err = s.DBPool.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, first_name, last_name, role, token_salt)
		VALUES ($1, $2, $3, $4, $5, 'startup_owner', gen_random_bytes(32))
	`, userID, "test@example.com", "hashedpassword", "Test", "User")
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	// After creating the test user, generate a JWT token
	salt := make([]byte, 32)
	_, err = rand.Read(salt)
	if err != nil {
		t.Fatalf("failed to generate salt: %v", err)
	}

	// Update user with salt
	_, err = s.DBPool.Exec(ctx, "UPDATE users SET token_salt = $1 WHERE id = $2", salt, userID)
	if err != nil {
		t.Fatalf("failed to update user salt: %v", err)
	}

	// Generate tokens
	accessToken, _, err := jwt.GenerateWithSalt(userID, "startup_owner", salt)
	if err != nil {
		t.Fatalf("failed to generate tokens: %v", err)
	}

	// First create a company
	description := "Test Company Description"
	companyPayload := CreateCompanyRequest{
		OwnerUserID: userID,  // Use the created user's ID instead of zeros
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

	if rec.Code != http.StatusCreated {
		t.Fatalf("Failed to create company. Status: %d, Response: %s", rec.Code, rec.Body.String())
	}

	companyID, ok := companyResponse["ID"].(string)
	if !assert.True(t, ok, "Company ID should be a string") {
		t.Fatalf("Failed to get company ID from response: %v", companyResponse)
	}

	// Now create a project
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
	req.Header.Set("Authorization", "Bearer "+accessToken)
	rec = httptest.NewRecorder()
	s.echoInstance.ServeHTTP(rec, req)

	t.Logf("Project creation response: %s", rec.Body.String())

	var projectResponse map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&projectResponse)
	if !assert.NoError(t, err) {
		t.Fatalf("Failed to decode project response: %v", err)
	}

	if rec.Code != http.StatusCreated {
		t.Fatalf("Failed to create project. Status: %d, Response: %s", rec.Code, rec.Body.String())
	}

	projectID, ok := projectResponse["ID"].(string)
	if !assert.True(t, ok, "Project ID should be a string") {
		t.Fatalf("Failed to get project ID from response: %v", projectResponse)
	}

	// create a test tag
	tagPayload := CreateTagRequest{
		Name: "test-tag",
	}
	tagBody, _ := json.Marshal(tagPayload)

	req = httptest.NewRequest(http.MethodPost, "/api/v1/tags", bytes.NewReader(tagBody))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	s.echoInstance.ServeHTTP(rec, req)

	t.Logf("Tag creation response: %s", rec.Body.String())

	var tagResponse map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&tagResponse)
	if !assert.NoError(t, err) {
		t.Fatalf("Failed to decode tag response: %v", err)
	}

	if rec.Code != http.StatusCreated {
		t.Fatalf("Failed to create tag. Status: %d, Response: %s", rec.Code, rec.Body.String())
	}

	tagID, ok := tagResponse["ID"].(string)
	if !assert.True(t, ok, "Tag ID should be a string") {
		t.Fatalf("Failed to get tag ID from response: %v", tagResponse)
	}

	// test add project tag
	t.Run("add project tag", func(t *testing.T) {
		tagPayload := AddProjectTagRequest{
			TagID: tagID,
		}
		body, _ := json.Marshal(tagPayload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects/"+projectID+"/tags", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("Add tag response: %s", rec.Body.String())
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Equal(t, projectID, response["ProjectID"])
		assert.Equal(t, tagID, response["TagID"])
	})

	// test list project tags
	t.Run("list project tags", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID+"/tags", nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("List tags response: %s", rec.Body.String())
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)

		// The response contains the project_tag ID, not the tag ID directly
		projectTag := response[0]
		assert.Equal(t, tagID, projectTag["TagID"], "TagID should match the created tag")
		assert.Equal(t, projectID, projectTag["ProjectID"], "ProjectID should match the project")
	})

	// test delete project tag
	t.Run("delete project tag", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/projects/"+projectID+"/tags/"+tagID, nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("Delete tag response: %s", rec.Body.String())
		assert.Equal(t, http.StatusNoContent, rec.Code)

		// verify deletion using list endpoint
		req = httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID+"/tags", nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec = httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		t.Logf("List tags after delete response: %s", rec.Body.String())
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.Len(t, response, 0, "Tag list should be empty after deletion")
	})
}
