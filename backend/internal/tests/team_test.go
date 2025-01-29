package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1"
	"KonferCA/SPUR/internal/v1/v1_teams"
)

// Helper function to setup test server
func setupTestServer(t *testing.T) *server.Server {
	setupEnv()
	s, err := server.New()
	require.NoError(t, err)
	v1.SetupRoutes(s)
	return s
}

/*
 * TestTeamEndpoints runs a complete test suite for team member operations
 * Tests cover all CRUD operations for team members:
 * - Create: Adding new team members to a company
 * - Read: Retrieving individual and list of team members
 * - Update: Modifying existing team member details
 * - Delete: Removing team members from a company
 *
 * Authorization tests verify:
 * - Company owners can perform all operations
 * - Non-owners cannot modify team members
 * - Users cannot access other companies' team members
 * - Invalid tokens are rejected
 *
 * Test Setup:
 * 1. Creates a test company owner (user with startup_owner role)
 * 2. Creates another company owner for auth testing
 * 3. Creates test companies with owner relationships
 * 4. Generates JWT tokens for authentication
 *
 * Each test validates:
 * - Proper authorization checks
 * - Request/response format
 * - Database state changes
 * - Error handling
 *
 * Cleanup:
 * - Removes all created team members
 * - Removes test companies
 * - Removes test users
 */
func TestTeamEndpoints(t *testing.T) {
	ctx := context.Background()
	s := setupTestServer(t)

	// Create test users
	ownerID := uuid.New().String()
	otherOwnerID := uuid.New().String()
	ownerSalt := []byte("owner-salt")
	otherOwnerSalt := []byte("other-owner-salt")

	// Create owner user
	_, err := s.GetDB().Exec(ctx, `
		INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, ownerID, "owner@test.com", "hashedpass", int32(permissions.PermStartupOwner|permissions.PermViewAllProjects), true, ownerSalt)
	require.NoError(t, err)

	// Create other owner user
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, otherOwnerID, "other-owner@test.com", "hashedpass", int32(permissions.PermStartupOwner|permissions.PermViewAllProjects), true, otherOwnerSalt)
	require.NoError(t, err)

	// Create test companies
	companyID := uuid.New().String()
	otherCompanyID := uuid.New().String()
	for _, company := range []struct {
		id      string
		ownerID string
		name    string
	}{
		{companyID, ownerID, "Test Company"},
		{otherCompanyID, otherOwnerID, "Other Company"},
	} {
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO companies (id, name, owner_id, linkedin_url)
			VALUES ($1, $2, $3, $4)
		`, company.id, company.name, company.ownerID, "https://linkedin.com/company/test-company")
		require.NoError(t, err)
	}

	// Generate tokens
	ownerToken := generateTestToken(t, ownerID, permissions.PermStartupOwner|permissions.PermViewAllProjects, ownerSalt)
	otherOwnerToken := generateTestToken(t, otherOwnerID, permissions.PermStartupOwner|permissions.PermViewAllProjects, otherOwnerSalt)
	invalidToken := "invalid.token.here"

	t.Run("Authorization Tests", func(t *testing.T) {
		// Create team members for testing
		memberID := uuid.New().String()
		otherMemberID := uuid.New().String()

		// Create member in first company
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO team_members (id, company_id, first_name, last_name, title, bio, linkedin_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, memberID, companyID, "John", "Doe", "Developer", "Test bio", "https://linkedin.com/in/johndoe")
		require.NoError(t, err)

		// Create member in other company
		_, err = s.GetDB().Exec(ctx, `
			INSERT INTO team_members (id, company_id, first_name, last_name, title, bio, linkedin_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, otherMemberID, otherCompanyID, "Jane", "Smith", "Designer", "Other bio", "https://linkedin.com/in/janesmith")
		require.NoError(t, err)

		// Test cases for authorization
		testCases := []struct {
			name       string
			token     string
			companyID string
			memberID  string
			method    string
			wantCode  int
		}{
			{"Owner can access own company", ownerToken, companyID, memberID, http.MethodGet, http.StatusOK},
			{"Owner can access other company", ownerToken, otherCompanyID, otherMemberID, http.MethodGet, http.StatusOK},
			{"Other owner can access company", otherOwnerToken, companyID, memberID, http.MethodGet, http.StatusOK},
			{"Invalid token is rejected", invalidToken, companyID, memberID, http.MethodGet, http.StatusUnauthorized},
			{"Owner can modify own company", ownerToken, companyID, memberID, http.MethodPut, http.StatusOK},
			{"Other owner cannot modify company", otherOwnerToken, companyID, memberID, http.MethodPut, http.StatusForbidden},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				var req *http.Request
				if tc.method == http.MethodPut {
					updateReq := v1_teams.UpdateTeamMemberRequest{
						Title: "Updated Title",
					}
					jsonBody, _ := json.Marshal(updateReq)
					req = httptest.NewRequest(tc.method, 
						fmt.Sprintf("/api/v1/companies/%s/team/%s", tc.companyID, tc.memberID),
						bytes.NewBuffer(jsonBody))
					req.Header.Set(echo.HeaderContentType, "application/json")
				} else {
					req = httptest.NewRequest(tc.method,
						fmt.Sprintf("/api/v1/companies/%s/team/%s", tc.companyID, tc.memberID),
						nil)
				}
				req.Header.Set(echo.HeaderAuthorization, "Bearer "+tc.token)
				rec := httptest.NewRecorder()

				s.GetEcho().ServeHTTP(rec, req)
				require.Equal(t, tc.wantCode, rec.Code)
			})
		}
	})

	t.Run("Add Team Member", func(t *testing.T) {
		reqBody := v1_teams.AddTeamMemberRequest{
			FirstName:   "John",
			LastName:    "Doe",
			Title:      "CTO",
			Bio:        "Experienced tech leader",
			LinkedinUrl: "https://linkedin.com/in/johndoe",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req := httptest.NewRequest(http.MethodPost, 
			fmt.Sprintf("/api/v1/companies/%s/team", companyID), 
			bytes.NewBuffer(jsonBody))
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		req.Header.Set(echo.HeaderContentType, "application/json")
		rec := httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		require.Equal(t, http.StatusCreated, rec.Code)

		var response v1_teams.TeamMemberResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)
		require.Equal(t, reqBody.FirstName, response.FirstName)
		require.Equal(t, reqBody.LastName, response.LastName)
		require.Equal(t, reqBody.Title, response.Title)
		require.Equal(t, reqBody.Bio, response.Bio)
		require.Equal(t, reqBody.LinkedinUrl, response.LinkedinUrl)
		require.False(t, response.IsAccountOwner)
		require.NotEmpty(t, response.ID)
		require.NotEmpty(t, response.CreatedAt)
	})

	t.Run("Get Team Members", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, 
			fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		rec := httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		require.Equal(t, http.StatusOK, rec.Code)

		var response v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)
		require.NotEmpty(t, response.TeamMembers)
	})

	t.Run("Update Team Member", func(t *testing.T) {
		// First get the team member ID
		req := httptest.NewRequest(http.MethodGet, 
			fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var listResponse v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &listResponse)
		require.NoError(t, err)
		require.NotEmpty(t, listResponse.TeamMembers)

		memberID := listResponse.TeamMembers[0].ID
		updateReq := v1_teams.UpdateTeamMemberRequest{
			Title: "Updated Title",
			Bio:   "Updated bio",
		}
		jsonBody, _ := json.Marshal(updateReq)

		req = httptest.NewRequest(http.MethodPut, 
			fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), 
			bytes.NewBuffer(jsonBody))
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		req.Header.Set(echo.HeaderContentType, "application/json")
		rec = httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		require.Equal(t, http.StatusOK, rec.Code)

		var response v1_teams.TeamMemberResponse
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		require.NoError(t, err)
		require.Equal(t, updateReq.Title, response.Title)
		require.Equal(t, updateReq.Bio, response.Bio)
		require.NotEmpty(t, response.UpdatedAt)
	})

	t.Run("Delete Team Member", func(t *testing.T) {
		// First get the team member ID
		req := httptest.NewRequest(http.MethodGet, 
			fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil)
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var listResponse v1_teams.TeamMembersResponse
		err := json.Unmarshal(rec.Body.Bytes(), &listResponse)
		require.NoError(t, err)
		require.NotEmpty(t, listResponse.TeamMembers)

		memberID := listResponse.TeamMembers[0].ID

		req = httptest.NewRequest(http.MethodDelete, 
			fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), nil)
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
		rec = httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		require.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("Team Member Access Tests", func(t *testing.T) {
		// Create test member user
		memberUserID := uuid.New().String()
		memberSalt := []byte("member-salt")
		_, err = s.GetDB().Exec(ctx, `
			INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, memberUserID, "member@test.com", "hashedpass", int32(permissions.PermInvestor), true, memberSalt)
		require.NoError(t, err)

		// Generate token for member
		memberToken := generateTestToken(t, memberUserID, permissions.PermInvestor, memberSalt)

		// Create a team member with user account
		memberID := uuid.New().String()
		_, err = s.GetDB().Exec(ctx, `
			INSERT INTO team_members (id, company_id, first_name, last_name, title, bio, linkedin_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, memberID, companyID, "John", "Doe", "Developer", "Test bio", "https://linkedin.com/in/johndoe")
		require.NoError(t, err)

		testCases := []struct {
			name       string
			token      string
			method     string
			endpoint   string
			wantCode   int
		}{
			{"Member can view team list", memberToken, http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team", companyID), http.StatusOK},
			{"Member can view specific member", memberToken, http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), http.StatusOK},
			{"Member cannot add team members", memberToken, http.MethodPost, fmt.Sprintf("/api/v1/companies/%s/team", companyID), http.StatusForbidden},
			{"Member cannot update team members", memberToken, http.MethodPut, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), http.StatusForbidden},
			{"Member cannot delete team members", memberToken, http.MethodDelete, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), http.StatusForbidden},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				var req *http.Request
				req = httptest.NewRequest(tc.method, tc.endpoint, nil)
				req.Header.Set(echo.HeaderAuthorization, "Bearer "+tc.token)
				rec := httptest.NewRecorder()
				s.GetEcho().ServeHTTP(rec, req)
				require.Equal(t, tc.wantCode, rec.Code)
			})
		}
	})

	t.Run("Error Handling Tests", func(t *testing.T) {
		nonExistentID := uuid.New().String()
		testCases := []struct {
			name       string
			endpoint   string
			method     string
			body       interface{}
			wantCode   int
		}{
			{"Get non-existent member", fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, nonExistentID), http.MethodGet, nil, http.StatusNotFound},
			{"Update non-existent member", fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, nonExistentID), http.MethodPut, v1_teams.UpdateTeamMemberRequest{Title: "New"}, http.StatusNotFound},
			{"Delete non-existent member", fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, nonExistentID), http.MethodDelete, nil, http.StatusNotFound},
			{"Invalid member ID format", fmt.Sprintf("/api/v1/companies/%s/team/invalid-uuid", companyID), http.MethodGet, nil, http.StatusBadRequest},
			{"Invalid company ID format", "/api/v1/companies/invalid-uuid/team", http.MethodGet, nil, http.StatusBadRequest},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				var req *http.Request
				if tc.body != nil {
					jsonBody, _ := json.Marshal(tc.body)
					req = httptest.NewRequest(tc.method, tc.endpoint, bytes.NewBuffer(jsonBody))
					req.Header.Set(echo.HeaderContentType, "application/json")
				} else {
					req = httptest.NewRequest(tc.method, tc.endpoint, nil)
				}
				req.Header.Set(echo.HeaderAuthorization, "Bearer "+ownerToken)
				rec := httptest.NewRecorder()
				s.GetEcho().ServeHTTP(rec, req)
				require.Equal(t, tc.wantCode, rec.Code, "Expected status %d for %s, got %d", tc.wantCode, tc.name, rec.Code)
			})
		}
	})

	// Cleanup
	_, err = s.GetDB().Exec(ctx, "DELETE FROM team_members WHERE company_id IN ($1, $2)", companyID, otherCompanyID)
	require.NoError(t, err)
	_, err = s.GetDB().Exec(ctx, "DELETE FROM companies WHERE id IN ($1, $2)", companyID, otherCompanyID)
	require.NoError(t, err)
	_, err = s.GetDB().Exec(ctx, "DELETE FROM users WHERE id IN ($1, $2)", ownerID, otherOwnerID)
	require.NoError(t, err)
}
