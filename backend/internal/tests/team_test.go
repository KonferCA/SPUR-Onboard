package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_teams"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/labstack/echo/v4"
	"encoding/json"
	"bytes"
)

// Helper function to setup test server
func setupTestServer(t *testing.T) *server.Server {
	setupEnv()
	s, err := server.New()
	require.NoError(t, err)
	return s
}

// Helper function to generate test token
func generateTestToken(t *testing.T, userID string, role db.UserRole, salt []byte) string {
	token, _, err := jwt.GenerateWithSalt(userID, role, salt)
	require.NoError(t, err)
	return token
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

	// Create test company owner
	ownerID := uuid.New().String()
	companyID := uuid.New().String()

	// Create another company owner for auth testing
	otherOwnerID := uuid.New().String()
	otherCompanyID := uuid.New().String()

	// Create test users
	for _, user := range []struct {
		id    string
		email string
	}{
		{ownerID, "owner@test.com"},
		{otherOwnerID, "other@test.com"},
	} {
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO users (id, email, password, role, email_verified, token_salt)
			VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
		`, user.id, user.email, "hashedpass", db.UserRoleStartupOwner, true)
		require.NoError(t, err)
	}

	// Get salts for token generation
	var ownerSalt, otherOwnerSalt []byte
	err := s.GetDB().QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", ownerID).Scan(&ownerSalt)
	require.NoError(t, err)
	err = s.GetDB().QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", otherOwnerID).Scan(&otherOwnerSalt)
	require.NoError(t, err)

	// Create test companies
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
	ownerToken := generateTestToken(t, ownerID, db.UserRoleStartupOwner, ownerSalt)
	otherOwnerToken := generateTestToken(t, otherOwnerID, db.UserRoleStartupOwner, otherOwnerSalt)
	invalidToken := "invalid.token.here"

	t.Run("Authorization Tests", func(t *testing.T) {
		// Create a team member for testing
		memberID := uuid.New().String()
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO team_members (id, company_id, first_name, last_name, title, bio, linkedin_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, memberID, companyID, "John", "Doe", "Developer", "Test bio", "https://linkedin.com/in/johndoe")
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
			{"Owner cannot access other company", ownerToken, otherCompanyID, memberID, http.MethodGet, http.StatusUnauthorized},
			{"Other owner cannot access company", otherOwnerToken, companyID, memberID, http.MethodGet, http.StatusUnauthorized},
			{"Invalid token is rejected", invalidToken, companyID, memberID, http.MethodGet, http.StatusUnauthorized},
			{"Owner can modify own company", ownerToken, companyID, memberID, http.MethodPut, http.StatusOK},
			{"Other owner cannot modify company", otherOwnerToken, companyID, memberID, http.MethodPut, http.StatusUnauthorized},
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
		// Create a team member with user account
		memberUserID := uuid.New().String()
		memberID := uuid.New().String()
		
		// Create member's user account with investor role
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO users (id, email, password, role, email_verified, token_salt)
			VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
		`, memberUserID, "member@test.com", "hashedpass", db.UserRoleInvestor, true)
		require.NoError(t, err)

		// Get member's salt for token
		var memberSalt []byte
		err = s.GetDB().QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", memberUserID).Scan(&memberSalt)
		require.NoError(t, err)

		// Create team member
		_, err = s.GetDB().Exec(ctx, `
			INSERT INTO team_members (id, company_id, first_name, last_name, title, bio, linkedin_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, memberID, companyID, "Team", "Member", "Developer", "Bio", "https://linkedin.com/in/member")
		require.NoError(t, err)

		// Generate member token
		memberToken := generateTestToken(t, memberUserID, db.UserRoleInvestor, memberSalt)

		testCases := []struct {
			name       string
			token      string
			method     string
			endpoint   string
			body       interface{}
			wantCode   int
		}{
			{"Member can view team list", memberToken, http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team", companyID), nil, http.StatusOK},
			{"Member can view specific member", memberToken, http.MethodGet, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), nil, http.StatusOK},
			{"Member cannot add team members", memberToken, http.MethodPost, fmt.Sprintf("/api/v1/companies/%s/team", companyID), v1_teams.AddTeamMemberRequest{
				FirstName: "New",
				LastName: "Member",
				Title: "Role",
				Bio: "Bio",
				LinkedinUrl: "https://linkedin.com/in/new",
			}, http.StatusForbidden},
			{"Member cannot update team members", memberToken, http.MethodPut, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), v1_teams.UpdateTeamMemberRequest{
				Title: "New Title",
			}, http.StatusForbidden},
			{"Member cannot delete team members", memberToken, http.MethodDelete, fmt.Sprintf("/api/v1/companies/%s/team/%s", companyID, memberID), nil, http.StatusForbidden},
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
