package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestProjectDraft(t *testing.T) {
	// Setup test environment
	setupEnv()

	s, err := server.New()
	assert.NoError(t, err)

	// removing all existing questions that are inserted via migrations
	// the questions inserted by migrations can change over time so
	// they are not a reliable way to run tests.
	_, err = s.DBPool.Exec(context.Background(), "DELETE FROM project_questions;")
	require.NoError(t, err)

	// seeding database with sample questions
	testQuestionIds, err := seedTestProjectQuestions(s.DBPool)
	require.NoError(t, err)
	require.Equal(t, 4, len(testQuestionIds))

	// Create test user and get auth token
	ctx := context.Background()
	userID, email, password, err := createTestUser(ctx, s, uint32(permissions.PermSubmitProject|permissions.PermViewAllProjects|permissions.PermManageTeam))
	assert.NoError(t, err)
	defer removeTestUser(ctx, email, s)

	// Directly verify email in database
	err = s.GetQueries().UpdateUserEmailVerifiedStatus(ctx, db.UpdateUserEmailVerifiedStatusParams{
		ID:            userID,
		EmailVerified: true,
	})
	assert.NoError(t, err, "Should update email verification status")

	// Wait a moment to ensure DB updates are complete
	time.Sleep(100 * time.Millisecond)

	// Login
	loginBody := fmt.Sprintf(`{"email":"%s","password":"%s"}`, email, password)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(loginBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)

	if !assert.Equal(t, http.StatusOK, rec.Code, "Login should succeed") {
		t.FailNow()
	}

	// Parse login response
	var loginResp map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&loginResp)
	assert.NoError(t, err, "Should decode login response")

	accessToken, ok := loginResp["access_token"].(string)
	assert.True(t, ok, "Response should contain access_token")
	assert.NotEmpty(t, accessToken, "Access token should not be empty")

	// Create a company for the user
	companyID, err := createTestCompany(ctx, s, userID)
	assert.NoError(t, err, "Should create test company")
	defer removeTestCompany(ctx, companyID, s)

	// Create a test project to use in most tests
	projectID := createAndFillTestProject(t, s, accessToken, companyID)

	t.Run("Save Project Draft With Comment Restrictions", func(t *testing.T) {
		// Create two comments on different questions
		commentTargetQuestion := testQuestionIds[0] // First question
		otherTargetQuestion := testQuestionIds[1]   // Second question
		
		// Add first comment
		commentBody1 := fmt.Sprintf(`{
			"comment": "Test comment on first question",
			"target_id": "%s"
		}`, commentTargetQuestion)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments", projectID),
			strings.NewReader(commentBody1))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var commentResp1 map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&commentResp1)
		assert.NoError(t, err)
		// Comment ID is only used in logs for debugging
		_ = commentResp1["id"].(string)
		
		// Add second comment
		commentBody2 := fmt.Sprintf(`{
			"comment": "Test comment on second question",
			"target_id": "%s"
		}`, otherTargetQuestion)

		req = httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments", projectID),
			strings.NewReader(commentBody2))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var commentResp2 map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&commentResp2)
		assert.NoError(t, err)
		comment2ID := commentResp2["id"].(string)
		
		// Verify project is in needs_review status with allow_edit=true
		req = httptest.NewRequest(http.MethodGet, 
			fmt.Sprintf("/api/v1/project/%s", projectID), 
			nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		
		var projectResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&projectResp)
		assert.NoError(t, err)
		assert.Equal(t, "needs review", projectResp["status"])
		assert.Equal(t, true, projectResp["allow_edit"])
		
		// Mark second comment as resolved with a snapshot_id
		var snapshotID string
		row := s.GetDB().QueryRow(ctx, `
			INSERT INTO project_snapshots (project_id, data, version_number, title)
			VALUES
			($1, '{}', 1, 'Test Project')
			RETURNING id;
			`, projectID)
		err = row.Scan(&snapshotID)
		require.NoError(t, err, "Project snapshot was not inserted")

		_, err = s.GetDB().Exec(ctx, `
			UPDATE project_comments
			SET
				resolved = true,
				resolved_by_snapshot_id = $1
			WHERE id = $2
		`, snapshotID, comment2ID)
		require.NoError(t, err)
		
		// Test 1: Try to save draft for the first question (should succeed - has unresolved comment)
		draftBody1 := fmt.Sprintf(`{
			"draft": [
				{
					"question_id": "%s",
					"answer": "Updated answer to the first question"
				}
			]
		}`, commentTargetQuestion)
		
		req = httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/draft", projectID),
			strings.NewReader(draftBody1))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		
		assert.Equal(t, http.StatusOK, rec.Code, "Should allow draft save for question with non-snapshot-resolved comment")
		
		// Test 2: Try to save draft for the second question (should fail - has snapshot-resolved comment)
		draftBody2 := fmt.Sprintf(`{
			"draft": [
				{
					"question_id": "%s",
					"answer": "Updated answer to the second question"
				}
			]
		}`, otherTargetQuestion)
		
		req = httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/draft", projectID),
			strings.NewReader(draftBody2))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		
		assert.Equal(t, http.StatusBadRequest, rec.Code, "Should not allow draft save for question with snapshot-resolved comment")
		var draftErrorResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&draftErrorResp)
		assert.NoError(t, err)
		assert.Contains(t, draftErrorResp["message"].(string), "No eligible questions to update")
		
		// Test 3: Try mixed draft update (should succeed for valid question only)
		draftBody3 := fmt.Sprintf(`{
			"draft": [
				{
					"question_id": "%s",
					"answer": "Another update to the first question"
				},
				{
					"question_id": "%s",
					"answer": "This update should be skipped"
				}
			]
		}`, commentTargetQuestion, otherTargetQuestion)
		
		req = httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/draft", projectID),
			strings.NewReader(draftBody3))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		
		assert.Equal(t, http.StatusOK, rec.Code, "Should partially succeed with mixed draft update")
	})
}