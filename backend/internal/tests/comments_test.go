package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCommentEndpoints(t *testing.T) {
	// Setup test environment
	setupEnv()
	s := setupTestServer(t)
	require.NotNil(t, s)

	ctx := context.Background()

	// Create test user and get auth token
	userID, email, password, err := createTestUser(ctx, s)
	require.NoError(t, err)

	// Update user role to admin and verify email
	_, err = s.GetDB().Exec(ctx, `
		UPDATE users 
		SET role = 'admin',
			email_verified = true
		WHERE id = $1
	`, userID)
	require.NoError(t, err)

	// Create test company with the user as owner
	companyID := uuid.New()
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO companies (
			id,
			owner_id,
			name,
			linkedin_url,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, extract(epoch from now()), extract(epoch from now()))
	`, companyID, userID, "Test Company", "https://linkedin.com/company/test-company")
	require.NoError(t, err)

	// Create test project owned by the company
	projectID := uuid.New()
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO projects (
			id, 
			company_id,
			title,
			status, 
			created_at, 
			updated_at
		)
		VALUES ($1, $2, $3, $4, extract(epoch from now()), extract(epoch from now()))
	`, projectID, companyID, "Test Project", "draft")
	require.NoError(t, err)

	// Login to get access token
	loginBody := map[string]string{
		"email":    email,
		"password": password,
	}
	jsonBody, err := json.Marshal(loginBody)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(jsonBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)
	require.Equal(t, http.StatusOK, rec.Code)

	var loginResp map[string]interface{}
	err = json.Unmarshal(rec.Body.Bytes(), &loginResp)
	require.NoError(t, err)
	accessToken := loginResp["access_token"].(string)

	// Create test comment
	commentID := uuid.New()
	targetID := uuid.New() // Store target_id for reuse
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO project_comments (
			id,
			project_id,
			target_id,
			comment,
			commenter_id,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, extract(epoch from now()), extract(epoch from now()))
	`, commentID, projectID, targetID, "Test comment", userID)
	require.NoError(t, err)

	t.Run("Create Comment", func(t *testing.T) {
		testCases := []struct {
			name         string
			body         map[string]interface{}
			projectID    string
			expectedCode int
			expectError  bool
			errorMessage string
		}{
			{
				name: "valid comment",
				body: map[string]interface{}{
					"comment":    "This is a test comment",
					"target_id": targetID.String(),
				},
				expectedCode: http.StatusCreated,
				expectError:  false,
			},
			{
				name: "empty comment",
				body: map[string]interface{}{
					"comment":    "",
					"target_id": targetID.String(),
				},
				expectedCode: http.StatusBadRequest,
				expectError:  true,
				errorMessage: "Invalid request data",
			},
			{
				name: "invalid project ID",
				body: map[string]interface{}{
					"comment":    "Test comment",
					"target_id": targetID.String(),
				},
				projectID:    uuid.New().String(),
				expectedCode: http.StatusNotFound,
				expectError:  true,
				errorMessage: "Project not found",
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				jsonBody, err := json.Marshal(tc.body)
				require.NoError(t, err)

				testProjectID := projectID.String()
				if tc.projectID != "" {
					testProjectID = tc.projectID
				}

				req := httptest.NewRequest(http.MethodPost,
					fmt.Sprintf("/api/v1/project/%s/comments", testProjectID),
					bytes.NewReader(jsonBody))
				req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
				req.Header.Set(echo.HeaderAuthorization, "Bearer "+accessToken)

				rec := httptest.NewRecorder()
				s.GetEcho().ServeHTTP(rec, req)
				assert.Equal(t, tc.expectedCode, rec.Code)

				if tc.expectError {
					var errResp map[string]interface{}
					err := json.Unmarshal(rec.Body.Bytes(), &errResp)
					assert.NoError(t, err)
					assert.Contains(t, errResp["message"], tc.errorMessage)
				} else {
					var response map[string]interface{}
					err := json.Unmarshal(rec.Body.Bytes(), &response)
					assert.NoError(t, err)
					assert.Equal(t, tc.body["comment"], response["comment"])
				}
			})
		}
	})

	t.Run("Get Project Comments", func(t *testing.T) {
		// Clear existing comments before test
		_, err = s.GetDB().Exec(ctx, `DELETE FROM project_comments WHERE project_id = $1`, projectID)
		require.NoError(t, err)

		// Create exactly 3 test comments
		for i := 1; i <= 3; i++ {
			commentID := uuid.New()
			_, err := s.GetDB().Exec(ctx, `
				INSERT INTO project_comments (
					id,
					project_id,
					target_id,
					comment,
					commenter_id,
					created_at,
					updated_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, $6)
			`, commentID, projectID, targetID, fmt.Sprintf("Test comment %d", i), userID, time.Now().Unix())
			require.NoError(t, err)
		}

		req := httptest.NewRequest(http.MethodGet,
			fmt.Sprintf("/api/v1/project/%s/comments", projectID),
				nil)
		req.Header.Set(echo.HeaderAuthorization, "Bearer "+accessToken)
		rec := httptest.NewRecorder()

		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response struct {
			Comments []struct {
				ID          string `json:"id"`
				Comment     string `json:"comment"`
				CommenterID string `json:"commenter_id"`
				CreatedAt   int64  `json:"created_at"`
			} `json:"comments"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response.Comments, 3)
	})

	t.Run("Update Comment", func(t *testing.T) {
		// Create a test comment
		commentID := uuid.New()
		targetID := uuid.New() // Add target_id
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO project_comments (
				id, 
				project_id, 
				target_id,
				comment,
				commenter_id,
				created_at,
				updated_at
			)
			VALUES ($1, $2, $3, $4, $5, extract(epoch from now()), extract(epoch from now()))
		`, commentID, projectID, targetID, "Original comment", userID)
		require.NoError(t, err)

		tests := []struct {
			name         string
			commentID    string
			payload      map[string]interface{}
			expectedCode int
			expectError  bool
			errorMessage string
		}{
			{
				name:      "valid_update",
				commentID: commentID.String(),
				payload: map[string]interface{}{
					"comment": "Updated comment",
				},
				expectedCode: http.StatusOK,
				expectError:  false,
			},
			{
				name:      "empty_comment",
				commentID: commentID.String(),
				payload: map[string]interface{}{
					"comment": "",
				},
				expectedCode: http.StatusBadRequest,
				expectError:  true,
				errorMessage: "Invalid request",
			},
			{
				name:      "non-existent_comment",
				commentID: uuid.New().String(),
				payload: map[string]interface{}{
					"comment": "Updated comment",
				},
				expectedCode: http.StatusInternalServerError,
				expectError:  true,
				errorMessage: "Failed to update comment",
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				jsonBody, _ := json.Marshal(tc.payload)
				req := httptest.NewRequest(
					http.MethodPut,
					fmt.Sprintf("/api/v1/project/%s/comments/%s", projectID, tc.commentID),
					bytes.NewBuffer(jsonBody),
				)
				req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
				req.Header.Set(echo.HeaderAuthorization, "Bearer "+accessToken)
				rec := httptest.NewRecorder()

				s.GetEcho().ServeHTTP(rec, req)
				assert.Equal(t, tc.expectedCode, rec.Code)

				if tc.expectError {
					var errResp map[string]interface{}
					err := json.Unmarshal(rec.Body.Bytes(), &errResp)
					assert.NoError(t, err)
					assert.Contains(t, errResp["message"], tc.errorMessage)
				} else {
					var response map[string]interface{}
					err := json.Unmarshal(rec.Body.Bytes(), &response)
					assert.NoError(t, err)
					assert.Equal(t, "Comment updated successfully", response["message"])
				}
			})
		}
	})

	// Cleanup
	defer func() {
		// Delete comments first
		_, err = s.GetDB().Exec(ctx, `DELETE FROM project_comments WHERE project_id = $1`, projectID)
		require.NoError(t, err)
		
		// Delete project
		_, err = s.GetDB().Exec(ctx, `DELETE FROM projects WHERE id = $1`, projectID)
		require.NoError(t, err)
		
		// Delete company
		_, err = s.GetDB().Exec(ctx, `DELETE FROM companies WHERE id = $1`, companyID)
		require.NoError(t, err)
		
		// Delete user last
		_, err = s.GetDB().Exec(ctx, `DELETE FROM users WHERE id = $1`, userID)
		require.NoError(t, err)
	}()
} 