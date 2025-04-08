package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// test constants for project validation
const (
	testCompanyWebsite       = "https://example-company.com"
	testValuePropositionText = "Our product provides a unique solution that addresses critical needs in the market. It offers unprecedented performance, reliability, and cost-effectiveness compared to existing alternatives. The proprietary technology enables seamless integration with existing systems."
	testCoreProductText      = "Our core service is a comprehensive platform that solves multiple pain points for enterprise customers. The solution integrates with existing workflows while providing enhanced security, analytics, and collaboration features. It significantly reduces operational overhead and improves productivity across organizations."
	testCompanyName          = "TechVision"

	// error case test constants
	testInvalidProjectID = "invalid-id"
	testShortAnswer      = "too short"
	testInvalidURL       = "not-a-url"
)

// helper function to create a new test project
func createTestProject(t *testing.T, s *server.Server, accessToken string, companyID string) string {
	projectBody := fmt.Sprintf(`{
        "company_id": "%s",
        "title": "Test Project",
        "description": "A test project",
        "name": "Test Project"
    }`, companyID)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/project/new", strings.NewReader(projectBody))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code, "Project creation should succeed")

	var resp map[string]interface{}
	err := json.NewDecoder(rec.Body).Decode(&resp)
	require.NoError(t, err)

	projectID, ok := resp["id"].(string)
	require.True(t, ok, "Response should contain project ID")
	require.NotEmpty(t, projectID, "Project ID should not be empty")

	return projectID
}

// helper function to get questions for a project
func getProjectQuestions(t *testing.T, s *server.Server, accessToken string) []struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Section  string `json:"section"`
} {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project/questions", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code, "Getting questions should succeed")

	var questionsResp struct {
		Questions []struct {
			ID       string `json:"id"`
			Question string `json:"question"`
			Section  string `json:"section"`
		} `json:"questions"`
	}
	err := json.NewDecoder(rec.Body).Decode(&questionsResp)
	require.NoError(t, err)
	require.NotEmpty(t, questionsResp.Questions, "Should have questions available")

	return questionsResp.Questions
}

// helper function to create an answer for a project
func createAnswerForProject(t *testing.T, s *server.Server, accessToken string, projectID string, questionID string, content string) {
	createBody := map[string]interface{}{
		"content":     content,
		"question_id": questionID,
	}
	createJSON, err := json.Marshal(createBody)
	require.NoError(t, err)

	createReq := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/project/%s/answers", projectID),
		bytes.NewReader(createJSON),
	)
	createReq.Header.Set("Authorization", "Bearer "+accessToken)
	createReq.Header.Set("Content-Type", "application/json")
	createRec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(createRec, createReq)

	require.Equal(t, http.StatusOK, createRec.Code, fmt.Sprintf("Creating answer for %s should succeed", questionID))
}

// helper function to submit a project and check the result
func submitProject(t *testing.T, s *server.Server, accessToken string, projectID string) {
	submitPath := fmt.Sprintf("/api/v1/project/%s/submit", projectID)
	req := httptest.NewRequest(http.MethodPost, submitPath, nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code, "Project submission should succeed")

	var submitResp struct {
		Message string `json:"message"`
		Status  string `json:"status"`
	}
	err := json.NewDecoder(rec.Body).Decode(&submitResp)
	require.NoError(t, err)
	assert.Equal(t, "Project submitted successfully", submitResp.Message)
	assert.Equal(t, "pending", submitResp.Status)
}

// helper function to create a test project with all required answers
func createAndFillTestProject(t *testing.T, s *server.Server, accessToken string, companyID string) string {
	// Create project
	projectID := createTestProject(t, s, accessToken, companyID)

	// Get questions
	questions := getProjectQuestions(t, s, accessToken)

	// Create answers for each required question
	for _, q := range questions {
		var answer string
		switch q.Question {
		case "Company website":
			answer = testCompanyWebsite
		case "What is the core product or service, and what problem does it solve?":
			answer = testCoreProductText
		case "What is the unique value proposition?":
			answer = testValuePropositionText
		case "What is your company/project name?":
			answer = testCompanyName
		default:
			continue // Skip non-required questions
		}

		createAnswerForProject(t, s, accessToken, projectID, q.ID, answer)
	}

	return projectID
}

func seedTestProjectQuestions(pool *pgxpool.Pool) (ids []string, err error) {
	var id string
	ctx := context.Background()
	sqls := []string{
		`
SELECT insert_question_with_input_types(
    'Company website',
    'Test',
    'Sub-Test',
    0, 0, 0,
    true,
    'textinput',
    'company_website',
    NULL,
    ARRAY['url']
) as id;
        `,
		`
SELECT insert_question_with_input_types(
    'What is the unique value proposition?',
    'Test',
    'Sub-Test',
    0, 0, 1,
    true,
    'textinput',
    'unique_value_proposition',
    NULL,
    ARRAY['min=50']
) as id;
        `,
		`
SELECT insert_question_with_input_types(
    'What is the core product or service, and what problem does it solve?',
    'Test',
    'Sub-Test',
    0, 0, 2,
    true,
    'textinput',
    'core_product',
    NULL,
    ARRAY['min=100']
) as id;
        `,
		`
SELECT insert_question_with_input_types(
    'What is your company/project name?',
    'Test',
    'Sub-Test',
    0, 0, 3,
    true,
    'textinput',
    'company_name',
    NULL,
    NULL
) as id;
        `,
	}

	for _, sql := range sqls {
		row := pool.QueryRow(ctx, sql)
		err = row.Scan(&id)
		if err != nil {
			return
		}
		ids = append(ids, id)
	}

	return
}

/*
 * TestProjectEndpoints tests the complete project lifecycle and error cases
 * for the project-related API endpoints. It covers:
 * - Project creation
 * - Project listing
 * - Project retrieval
 * - Project submission including answering questions
 * - Error handling for various invalid scenarios
 *
 * The test creates a verified user and company first, then runs
 * through the project workflows using that test data.
 */
func TestProjectEndpoints(t *testing.T) {
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

	// Create admin user with comment permissions
	ctx := context.Background()
	userID, email, password, err := createTestAdmin(ctx, s)
	assert.NoError(t, err)
	defer removeTestUser(ctx, email, s)

	// Verify the user exists and check their status
	user, err := s.GetQueries().GetUserByEmail(ctx, email)
	assert.NoError(t, err, "Should find user in database")

	// Directly verify email in database
	err = s.GetQueries().UpdateUserEmailVerifiedStatus(ctx, db.UpdateUserEmailVerifiedStatusParams{
		ID:            userID,
		EmailVerified: true,
	})
	assert.NoError(t, err, "Should update email verification status")

	// Verify the update worked
	user, err = s.GetQueries().GetUserByEmail(ctx, email)
	assert.NoError(t, err)
	assert.True(t, user.EmailVerified, "User's email should be verified")

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

	t.Run("List Projects", func(t *testing.T) {
		/*
		 * "List Projects" test verifies:
		 * - Endpoint returns 200 OK
		 * - User can see their projects
		 * - Response contains all expected fields
		 */
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects", nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)

		// Verify the response contains project data
		var resp map[string][]interface{}
		err := json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)

		// Verify at least one project is returned
		assert.Greater(t, len(resp["projects"]), 0, "Response should contain at least one project")

		// Verify all expected fields are present in the first project
		project := resp["projects"][0].(map[string]interface{})
		assert.Contains(t, project, "id", "Project should have id field")
		assert.Contains(t, project, "title", "Project should have title field")
		assert.Contains(t, project, "description", "Project should have description field")
		assert.Contains(t, project, "status", "Project should have status field")
		assert.Contains(t, project, "allow_edit", "Project should have allow_edit field")
		assert.Contains(t, project, "created_at", "Project should have created_at field")
		assert.Contains(t, project, "updated_at", "Project should have updated_at field")
		assert.Contains(t, project, "company_name", "Project should have company_name field")
		assert.Contains(t, project, "document_count", "Project should have document_count field")
		assert.Contains(t, project, "team_member_count", "Project should have team_member_count field")
	})

	t.Run("Get Project", func(t *testing.T) {
		/*
		 * "Get Project" test verifies:
		 * - Single project retrieval works
		 * - Project details are accessible
		 * - Response contains all expected fields
		 */
		path := fmt.Sprintf("/api/v1/project/%s", projectID)

		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)

		// Verify the response contains the correct project ID
		var resp map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)

		id, ok := resp["id"].(string)
		assert.True(t, ok, "Response should contain id field")
		assert.Equal(t, projectID, id, "Should return the requested project")

		// Verify all expected fields are present
		assert.Contains(t, resp, "id", "Project should have id field")
		assert.Contains(t, resp, "title", "Project should have title field")
		assert.Contains(t, resp, "description", "Project should have description field")
		assert.Contains(t, resp, "status", "Project should have status field")
		assert.Contains(t, resp, "allow_edit", "Project should have allow_edit field")
		assert.Contains(t, resp, "created_at", "Project should have created_at field")
		assert.Contains(t, resp, "updated_at", "Project should have updated_at field")
	})

	t.Run("Submit Project", func(t *testing.T) {
		// Create a new project specifically for this test
		projectIDToSubmit := createAndFillTestProject(t, s, accessToken, companyID)

		// Add a comment that needs to be resolved
		commentBody := fmt.Sprintf(`{
			"comment": "Test comment for submission resolution",
			"target_id": "%s"
		}`, projectIDToSubmit)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments", projectIDToSubmit),
			strings.NewReader(commentBody))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		// Check that comment was created successfully
		assert.Equal(t, http.StatusCreated, rec.Code, "Comment creation should succeed")

		var commentResp map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&commentResp)
		assert.NoError(t, err)

		commentID, ok := commentResp["id"].(string)
		assert.True(t, ok, "Response should contain comment ID")
		assert.NotEmpty(t, commentID, "Comment ID should not be empty")

		// Resolve the comment before submission
		resolveReq := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments/%s/resolve", projectIDToSubmit, commentID),
			nil)
		resolveReq.Header.Set("Authorization", "Bearer "+accessToken)
		resolveRec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(resolveRec, resolveReq)
		assert.Equal(t, http.StatusOK, resolveRec.Code, "Resolving comment should succeed")

		// Submit the project
		submitProject(t, s, accessToken, projectIDToSubmit)

		// Verify the project status was updated in the database
		req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/project/%s", projectIDToSubmit), nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var resp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)

		status, ok := resp["status"].(string)
		assert.True(t, ok, "Response should contain status field")
		assert.Equal(t, "pending", status, "Project status should be pending after submission")

		// Check if the comment has resolved_by_snapshot_id set
		commentReq := httptest.NewRequest(http.MethodGet,
			fmt.Sprintf("/api/v1/project/%s/comments/%s", projectIDToSubmit, commentID),
			nil)
		commentReq.Header.Set("Authorization", "Bearer "+accessToken)
		commentRec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(commentRec, commentReq)
		assert.Equal(t, http.StatusOK, commentRec.Code, "Retrieving comment should succeed")

		var getCommentResp map[string]interface{}
		err = json.NewDecoder(commentRec.Body).Decode(&getCommentResp)
		assert.NoError(t, err)
		assert.True(t, getCommentResp["resolved"].(bool), "Comment should be resolved")
		assert.NotNil(t, getCommentResp["resolved_by_snapshot_id"], "resolved_by_snapshot_id should be set")
		assert.NotEmpty(t, getCommentResp["resolved_by_snapshot_id"], "resolved_by_snapshot_id should not be empty")
	})

	t.Run("Get Latest Project Snapshot", func(t *testing.T) {
		// Create a new project specifically for this test
		projectIDToSubmit := createAndFillTestProject(t, s, accessToken, companyID)

		// Submit the project to ensure a snapshot is created
		submitProject(t, s, accessToken, projectIDToSubmit)

		// Get the latest snapshot
		snapshotPath := fmt.Sprintf("/api/v1/project/%s/snapshots/latest", projectIDToSubmit)
		req := httptest.NewRequest(http.MethodGet, snapshotPath, nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		// Verify response status
		assert.Equal(t, http.StatusOK, rec.Code, "Getting latest snapshot should succeed")

		// Parse response
		var snapshot db.ProjectSnapshot
		err := json.NewDecoder(rec.Body).Decode(&snapshot)
		assert.NoError(t, err, "Should decode snapshot response")

		// Validate snapshot basic properties
		assert.NotEmpty(t, snapshot.ID, "Snapshot ID should not be empty")
		assert.Equal(t, projectIDToSubmit, snapshot.ProjectID, "Snapshot project ID should match submitted project ID")
		assert.NotEmpty(t, snapshot.Data, "Snapshot data should not be empty")
		assert.Equal(t, int32(1), snapshot.VersionNumber, "First snapshot should have version number 1")
		assert.NotEmpty(t, snapshot.Title, "Snapshot title should not be empty")
		assert.Greater(t, snapshot.CreatedAt, int64(0), "Snapshot creation timestamp should be positive")

		// Test unauthorized access (using an admin-only account to access the snapshot)
		// Create a new user with insufficient permissions
		limitedUserID, limitedEmail, limitedPassword, err := createTestUser(ctx, s, uint32(permissions.PermViewAllProjects))
		assert.NoError(t, err)
		defer removeTestUser(ctx, limitedEmail, s)

		// Verify the user exists and check their status
		_, err = s.GetQueries().GetUserByEmail(ctx, limitedEmail)
		assert.NoError(t, err, "Should find user in database")

		// Directly verify email in database
		err = s.GetQueries().UpdateUserEmailVerifiedStatus(ctx, db.UpdateUserEmailVerifiedStatusParams{
			ID:            limitedUserID,
			EmailVerified: true,
		})
		assert.NoError(t, err, "Should update email verification status")

		// Login as limited user
		limitedToken := loginAndGetToken(t, s, limitedEmail, limitedPassword)
		require.NotEmpty(t, limitedToken)

		// Try to access snapshot with insufficient permissions
		unauthorizedReq := httptest.NewRequest(http.MethodGet, snapshotPath, nil)
		unauthorizedReq.Header.Set("Authorization", "Bearer "+limitedToken)
		unauthorizedRec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(unauthorizedRec, unauthorizedReq)

		// This should fail with a 403 Forbidden (as the user can't access the project)
		assert.Equal(t, http.StatusForbidden, unauthorizedRec.Code, "User without project access should not be able to get snapshot")
	})

	/*
	 * "Error Cases" test suite verifies proper error handling:
	 * - Invalid project ID returns 404
	 * - Unauthorized access returns 401
	 * - Short answers fail validation
	 * - Invalid URL format fails validation
	 *
	 * Uses real question/answer IDs from the project to ensure
	 * accurate validation testing.
	 */
	t.Run("Error Cases", func(t *testing.T) {
		// First get the questions/answers to get real IDs
		path := fmt.Sprintf("/api/v1/project/%s/answers", projectID)
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		var answersResp struct {
			Answers []struct {
				ID         string `json:"id"`
				QuestionID string `json:"question_id"`
				Question   string `json:"question"`
			} `json:"answers"`
		}
		err := json.NewDecoder(rec.Body).Decode(&answersResp)
		assert.NoError(t, err)

		// Find answer ID for the core product question (which has min length validation)
		var coreQuestionAnswerID string
		var websiteQuestionAnswerID string
		for _, a := range answersResp.Answers {
			if strings.Contains(a.Question, "core product") {
				coreQuestionAnswerID = a.ID
			}
			if strings.Contains(a.Question, "website") {
				websiteQuestionAnswerID = a.ID
			}
		}

		// Ensure we found the questions we need
		assert.NotEmpty(t, coreQuestionAnswerID, "Should find core product question")
		assert.NotEmpty(t, websiteQuestionAnswerID, "Should find website question")

		tests := []struct {
			name          string
			method        string
			path          string
			body          string
			setupAuth     func(*http.Request)
			expectedCode  int
			expectedError string
		}{
			{
				name:   "Get Invalid Project",
				method: http.MethodGet,
				path:   fmt.Sprintf("/api/v1/project/%s", testInvalidProjectID),
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer "+accessToken)
				},
				expectedCode:  http.StatusNotFound,
				expectedError: "Project not found",
			},
			{
				name:   "Unauthorized Access",
				method: http.MethodGet,
				path:   fmt.Sprintf("/api/v1/project/%s", projectID),
				setupAuth: func(req *http.Request) {
					// No auth header
				},
				expectedCode:  http.StatusUnauthorized,
				expectedError: "missing authorization header",
			},
			{
				name:   "Invalid Answer Length",
				method: http.MethodPatch,
				path:   fmt.Sprintf("/api/v1/project/%s/answers", projectID),
				body:   fmt.Sprintf(`{"content": "%s", "answer_id": "%s"}`, testShortAnswer, coreQuestionAnswerID),
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer "+accessToken)
				},
				expectedCode:  http.StatusBadRequest,
				expectedError: "Must be at least",
			},
			{
				name:   "Invalid URL Format",
				method: http.MethodPatch,
				path:   fmt.Sprintf("/api/v1/project/%s/answers", projectID),
				body:   fmt.Sprintf(`{"content": "%s", "answer_id": "%s"}`, testInvalidURL, websiteQuestionAnswerID),
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer "+accessToken)
				},
				expectedCode:  http.StatusBadRequest,
				expectedError: "Must be a valid URL",
			},
			{
				name:   "Create Answer Without Question",
				method: http.MethodPost,
				path:   fmt.Sprintf("/api/v1/project/%s/answers", projectID),
				body:   `{"content": "some answer"}`, // Missing question_id
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer "+accessToken)
				},
				expectedCode:  http.StatusBadRequest,
				expectedError: "Question ID is required",
			},
			{
				name:   "Create Answer For Invalid Question",
				method: http.MethodPost,
				path:   fmt.Sprintf("/api/v1/project/%s/answers", projectID),
				body:   fmt.Sprintf(`{"content": "some answer", "question_id": "%s"}`, testInvalidProjectID),
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer "+accessToken)
				},
				expectedCode:  http.StatusNotFound,
				expectedError: "Question not found",
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				var body io.Reader
				if tc.body != "" {
					body = strings.NewReader(tc.body)
				}

				req := httptest.NewRequest(tc.method, tc.path, body)
				tc.setupAuth(req)
				if tc.body != "" {
					req.Header.Set("Content-Type", "application/json")
				}
				rec := httptest.NewRecorder()

				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedCode, rec.Code)

				var errResp struct {
					Message          string `json:"message"`
					ValidationErrors []struct {
						Question string `json:"question"`
						Message  string `json:"message"`
					} `json:"validation_errors"`
				}
				err := json.NewDecoder(rec.Body).Decode(&errResp)
				assert.NoError(t, err)

				if len(errResp.ValidationErrors) > 0 {
					assert.Contains(t, errResp.ValidationErrors[0].Message, tc.expectedError)
				} else {
					assert.Contains(t, errResp.Message, tc.expectedError)
				}
			})
		}
	})

	t.Run("Comment Resolution", func(t *testing.T) {
		// Create an admin user for testing
		adminID, adminEmail, adminPassword, err := createTestAdmin(ctx, s)
		assert.NoError(t, err)
		defer removeTestUser(ctx, adminEmail, s)

		// Create admin's company
		adminCompanyID, err := createTestCompany(ctx, s, adminID)
		assert.NoError(t, err)
		defer removeTestCompany(ctx, adminCompanyID, s)

		// Login as admin
		adminToken := loginAndGetToken(t, s, adminEmail, adminPassword)
		require.NotEmpty(t, adminToken)

		// Create a test comment first
		commentBody := fmt.Sprintf(`{
            "comment": "Test comment",
            "target_id": "%s"
        }`, projectID)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments", projectID),
			strings.NewReader(commentBody))
		req.Header.Set("Authorization", "Bearer "+adminToken)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusCreated, rec.Code, "Should be able to create test comment for comment resolution")

		var commentResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&commentResp)
		assert.NoError(t, err)

		commentID, ok := commentResp["id"].(string)
		assert.True(t, ok, "Response should contain comment ID")
		assert.NotEmpty(t, commentID, "Comment ID should not be empty")

		// Verify the allow_edit flag was set to true
		// Get project details to check allow_edit flag
		projectReq := httptest.NewRequest(http.MethodGet,
			fmt.Sprintf("/api/v1/project/%s", projectID),
			nil)
		projectReq.Header.Set("Authorization", "Bearer "+adminToken)
		projectRec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(projectRec, projectReq)

		var projectResp map[string]interface{}
		err = json.NewDecoder(projectRec.Body).Decode(&projectResp)
		assert.NoError(t, err)

		allowEdit, ok := projectResp["allow_edit"].(bool)
		assert.True(t, ok, "Response should contain allow_edit field")
		assert.True(t, allowEdit, "allow_edit should be set to true after comment creation")

		// Verify the project status was set to 'needs_review'
		status, ok := projectResp["status"].(string)
		assert.True(t, ok, "Response should contain status field")
		assert.Equal(t, "needs review", status, "Project status should be set to 'needs review' after comment creation")

		// Table-driven tests for comment resolution actions
		tests := []struct {
			name         string
			method       string
			path         string
			token        string
			expectedCode int
		}{
			{
				name:         "Admin Can Resolve Comment",
				method:       http.MethodPost,
				path:         fmt.Sprintf("/api/v1/project/%s/comments/%s/resolve", projectID, commentID),
				token:        adminToken,
				expectedCode: http.StatusOK,
			},
			{
				name:         "Admin Can Unresolve Comment",
				method:       http.MethodPost,
				path:         fmt.Sprintf("/api/v1/project/%s/comments/%s/unresolve", projectID, commentID),
				token:        adminToken,
				expectedCode: http.StatusOK,
			},
			{
				name:         "Non-Admin Can Resolve Comment",
				method:       http.MethodPost,
				path:         fmt.Sprintf("/api/v1/project/%s/comments/%s/resolve", projectID, commentID),
				token:        accessToken,
				expectedCode: http.StatusOK,
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				req := httptest.NewRequest(tc.method, tc.path, nil)
				req.Header.Set("Authorization", "Bearer "+tc.token)
				rec := httptest.NewRecorder()
				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedCode, rec.Code)
			})
		}
	})

	t.Run("Snapshot Resolved Comments", func(t *testing.T) {
		// Create another test comment
		commentBody := fmt.Sprintf(`{
            "comment": "Test comment for snapshot resolution",
            "target_id": "%s"
        }`, projectID)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments", projectID),
			strings.NewReader(commentBody))
		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusCreated, rec.Code)

		var createCommentResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&createCommentResp)
		assert.NoError(t, err)

		commentID, ok := createCommentResp["id"].(string)
		assert.True(t, ok, "Response should contain comment ID")
		assert.NotEmpty(t, commentID, "Comment ID should not be empty")

		// Manually insert snapshot for testing
		var snapshotID string
		row := s.GetDB().QueryRow(ctx, `
            INSERT INTO project_snapshots (project_id, data, version_number, title)
            VALUES
            ($1, '{}', 1, 'Test Project')
            RETURNING id;
            `, projectID)
		err = row.Scan(&snapshotID)
		require.NoError(t, err, "Project snapshot for comment resolution was not inserted")

		// Manually set the comment as resolved by a snapshot (simulating submission)
		_, err = s.GetDB().Exec(ctx, `
			UPDATE project_comments
			SET
				resolved = true,
				resolved_by_snapshot_id = $1
			WHERE id = $2
		`, snapshotID, commentID)
		require.NoError(t, err)

		// Try to unresolve the snapshot-resolved comment - should fail
		req = httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/v1/project/%s/comments/%s/unresolve", projectID, commentID),
			nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusBadRequest, rec.Code)

		var errResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&errResp)
		assert.NoError(t, err)
		assert.Contains(t, errResp["message"], "has been resolved by a previous submission")

		// Get the comment and verify it includes the snapshot info
		req = httptest.NewRequest(http.MethodGet,
			fmt.Sprintf("/api/v1/project/%s/comments/%s", projectID, commentID),
			nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)
		rec = httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)

		var getCommentResp map[string]interface{}
		err = json.NewDecoder(rec.Body).Decode(&getCommentResp)
		assert.NoError(t, err)
		assert.NotNil(t, getCommentResp["resolved_by_snapshot_id"])
		assert.Equal(t, snapshotID, getCommentResp["resolved_by_snapshot_id"])
	})
}
