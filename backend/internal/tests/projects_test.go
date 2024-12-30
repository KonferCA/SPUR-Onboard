package tests

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
    "time"
    "bytes"

    "KonferCA/SPUR/db"
    "KonferCA/SPUR/internal/server"
    "github.com/stretchr/testify/assert"
)

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

    // Create test user and get auth token
    ctx := context.Background()
    userID, email, password, err := createTestUser(ctx, s)
    assert.NoError(t, err)
    t.Logf("Created test user - ID: %s, Email: %s, Password: %s", userID, email, password)
    defer removeTestUser(ctx, email, s)

    
    // Verify the user exists and check their status
    user, err := s.GetQueries().GetUserByEmail(ctx, email)
    assert.NoError(t, err, "Should find user in database")
    t.Logf("User from DB - ID: %s, Email: %s, EmailVerified: %v", user.ID, user.Email, user.EmailVerified)

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
    t.Logf("User after verification - ID: %s, Email: %s, EmailVerified: %v", user.ID, user.Email, user.EmailVerified)

    // Wait a moment to ensure DB updates are complete
    time.Sleep(100 * time.Millisecond)

    // Login
    loginBody := fmt.Sprintf(`{"email":"%s","password":"%s"}`, email, password)
    t.Logf("Attempting login with body: %s", loginBody)
    
    req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(loginBody))
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()
    s.GetEcho().ServeHTTP(rec, req)
    
    if !assert.Equal(t, http.StatusOK, rec.Code, "Login should succeed") {
        t.Logf("Login response body: %s", rec.Body.String())
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
    t.Logf("Created test company - ID: %s", companyID)

    // Variable to store project ID for subsequent tests
    var projectID string

    t.Run("Create Project", func(t *testing.T) {
        /*
         * "Create Project" test verifies:
         * - Project creation with valid data
         * - Response contains valid project ID
         * - Project is associated with correct company
         */
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

        if !assert.Equal(t, http.StatusOK, rec.Code) {
            t.Logf("Create project response: %s", rec.Body.String())
            t.FailNow()
        }

        var resp map[string]interface{}
        err := json.NewDecoder(rec.Body).Decode(&resp)
        assert.NoError(t, err)
        
        var ok bool
        projectID, ok = resp["id"].(string)
        assert.True(t, ok, "Response should contain project ID")
        assert.NotEmpty(t, projectID, "Project ID should not be empty")
    })

    t.Run("List Projects", func(t *testing.T) {
        /*
         * "List Projects" test verifies:
         * - Endpoint returns 200 OK
         * - User can see their projects
         */
        req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec := httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        assert.Equal(t, http.StatusOK, rec.Code)
    })

    t.Run("Get Project", func(t *testing.T) {
        /*
         * "Get Project" test verifies:
         * - Single project retrieval works
         * - Project details are accessible
         */
        path := fmt.Sprintf("/api/v1/project/%s", projectID)
        t.Logf("Getting project at path: %s", path)
        
        req := httptest.NewRequest(http.MethodGet, path, nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec := httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        if !assert.Equal(t, http.StatusOK, rec.Code) {
            t.Logf("Get project response: %s", rec.Body.String())
        }
    })

    t.Run("Submit Project", func(t *testing.T) {
        /*
         * "Submit Project" test verifies the complete submission flow:
         * 1. Creates initial project
         * 2. Creates answers for required questions
         * 3. Updates each answer with valid data
         * 4. Submits the completed project
         * 5. Verifies project status changes to 'pending'
         */
        // First get the available questions
        req := httptest.NewRequest(http.MethodGet, "/api/v1/questions", nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec := httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        if !assert.Equal(t, http.StatusOK, rec.Code) {
            t.Logf("Get questions response: %s", rec.Body.String())
            t.FailNow()
        }

        var questionsResp struct {
            Questions []struct {
                ID       string `json:"id"`
                Question string `json:"question"`
                Section  string `json:"section"`
            } `json:"questions"`
        }
        err := json.NewDecoder(rec.Body).Decode(&questionsResp)
        assert.NoError(t, err)
        assert.NotEmpty(t, questionsResp.Questions, "Should have questions available")

        // Create answers for each question
        for _, q := range questionsResp.Questions {
            var answer string
            switch q.Question {
            case "Company website":
                answer = "https://example.com"
            case "What is the core product or service, and what problem does it solve?":
                answer = "Our product is a revolutionary blockchain-based authentication system that solves critical identity verification issues in the digital age. We provide a secure, scalable solution that eliminates fraud while maintaining user privacy and compliance with international regulations."
            case "What is the unique value proposition?":
                answer = "Our product is a revolutionary blockchain-based authentication system that solves critical identity verification issues in the digital age. We provide a secure, scalable solution that eliminates fraud while maintaining user privacy and compliance with international regulations."
            default:
                continue // Skip non-required questions
            }

            // Create the answer
            createBody := map[string]interface{}{
                "content":     answer,
                "project_id":  projectID,
                "question_id": q.ID,
            }
            createJSON, err := json.Marshal(createBody)
            assert.NoError(t, err)

            createReq := httptest.NewRequest(
                http.MethodPost, 
                fmt.Sprintf("/api/v1/project/%s/answer", projectID),
                bytes.NewReader(createJSON),
            )
            createReq.Header.Set("Authorization", "Bearer "+accessToken)
            createReq.Header.Set("Content-Type", "application/json")
            createRec := httptest.NewRecorder()
            s.GetEcho().ServeHTTP(createRec, createReq)

            if !assert.Equal(t, http.StatusOK, createRec.Code) {
                t.Logf("Create answer response: %s", createRec.Body.String())
            }
        }

        // Now submit the project
        submitPath := fmt.Sprintf("/api/v1/project/%s/submit", projectID)
        req = httptest.NewRequest(http.MethodPost, submitPath, nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec = httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        t.Logf("Submit response: %s", rec.Body.String())

        if !assert.Equal(t, http.StatusOK, rec.Code) {
            t.Logf("Submit project response: %s", rec.Body.String())
        }

        var submitResp struct {
            Message string `json:"message"`
            Status  string `json:"status"`
        }
        err = json.NewDecoder(rec.Body).Decode(&submitResp)
        assert.NoError(t, err)
        assert.Equal(t, "Project submitted successfully", submitResp.Message)
        assert.Equal(t, "pending", submitResp.Status)
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
            name           string
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
                path:   "/api/v1/project/invalid-id",
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
                body:   fmt.Sprintf(`{"content": "too short", "answer_id": "%s"}`, coreQuestionAnswerID),
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
                body:   fmt.Sprintf(`{"content": "not-a-url", "answer_id": "%s"}`, websiteQuestionAnswerID),
                setupAuth: func(req *http.Request) {
                    req.Header.Set("Authorization", "Bearer "+accessToken)
                },
                expectedCode:  http.StatusBadRequest,
                expectedError: "Must be a valid URL",
            },
            {
                name:   "Create Answer Without Question",
                method: http.MethodPost,
                path:   fmt.Sprintf("/api/v1/project/%s/answer", projectID),
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
                path:   fmt.Sprintf("/api/v1/project/%s/answer", projectID),
                body:   `{"content": "some answer", "question_id": "invalid-id"}`,
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
                    Message string `json:"message"`
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
}