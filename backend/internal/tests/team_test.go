package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_teams"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestTeamEndpoints(t *testing.T) {
	// Setup test environment
	setupEnv()

	// Initialize server
	s, err := server.New()
	assert.NoError(t, err)

	// Create test company and owner
	ctx := context.Background()
	ownerID := uuid.New()
	companyID := uuid.New()

	// Create test user (company owner)
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO users (id, email, password, role, email_verified, token_salt)
		VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
	`, ownerID, "owner@test.com", "hashedpass", db.UserRoleStartupOwner, true)
	assert.NoError(t, err)

	// Create test company
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO companies (id, owner_id, name, linkedin_url)
		VALUES ($1, $2, $3, $4)
	`, companyID, ownerID, "Test Company", "https://linkedin.com/company/test")
	assert.NoError(t, err)

	// Verify company exists
	var count int
	err = s.GetDB().QueryRow(ctx, "SELECT COUNT(*) FROM companies WHERE id = $1", companyID).Scan(&count)
	assert.NoError(t, err)
	assert.Equal(t, 1, count, "Company should exist in database")

	// Get user's token salt
	var salt []byte
	err = s.GetDB().QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", ownerID).Scan(&salt)
	assert.NoError(t, err)

	// Generate access token
	accessToken, _, err := jwt.GenerateWithSalt(ownerID.String(), db.UserRoleStartupOwner, salt)
	assert.NoError(t, err)

	t.Run("Add Team Member", func(t *testing.T) {
		reqBody := v1_teams.AddTeamMemberRequest{
			FirstName:   "John",
			LastName:    "Doe",
			Title:      "CTO",
			Bio:        "Experienced tech leader",
			LinkedinUrl: "https://linkedin.com/in/johndoe",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/companies/%s/team", companyID), bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response v1_teams.TeamMemberResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, reqBody.FirstName, response.FirstName)
		assert.Equal(t, reqBody.LastName, response.LastName)
		assert.Equal(t, reqBody.Title, response.Title)
		assert.Equal(t, reqBody.Bio, response.Bio)
		assert.Equal(t, reqBody.LinkedinUrl, response.LinkedinUrl)
		assert.False(t, response.IsAccountOwner)
		assert.NotEmpty(t, response.ID)
		assert.NotEmpty(t, response.CreatedAt)
	})

	t.Run("Get Team Members", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		rec := httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.TeamMembers)
	})

	t.Run("Update Team Member", func(t *testing.T) {
		// First, get a team member ID
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var listResponse v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &listResponse)
		assert.NoError(t, err)
		assert.NotEmpty(t, listResponse.TeamMembers)

		memberID := listResponse.TeamMembers[0].ID
		updateReq := v1_teams.UpdateTeamMemberRequest{
			Title: "Updated Title",
			Bio:   "Updated bio",
		}
		jsonBody, _ := json.Marshal(updateReq)

		req = httptest.NewRequest(http.MethodPut, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		req.Header.Set("Content-Type", "application/json")
		rec = httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response v1_teams.TeamMemberResponse
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, updateReq.Title, response.Title)
		assert.Equal(t, updateReq.Bio, response.Bio)
		assert.NotEmpty(t, response.UpdatedAt)
	})

	t.Run("Delete Team Member", func(t *testing.T) {
		// First, get a team member ID
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var listResponse v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &listResponse)
		assert.NoError(t, err)
		assert.NotEmpty(t, listResponse.TeamMembers)

		memberID := listResponse.TeamMembers[0].ID

		req = httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		rec = httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	// Cleanup
	_, err = s.GetDB().Exec(ctx, "DELETE FROM companies WHERE id = $1", companyID)
	assert.NoError(t, err)
	_, err = s.GetDB().Exec(ctx, "DELETE FROM users WHERE id = $1", ownerID)
	assert.NoError(t, err)
}
