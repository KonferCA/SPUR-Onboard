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
    "KonferCA/SPUR/internal/v1/v1_common"
    "github.com/stretchr/testify/assert"
)

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
        req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec := httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        assert.Equal(t, http.StatusOK, rec.Code)
    })

    t.Run("Get Project", func(t *testing.T) {
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
        // First get the questions/answers
        path := fmt.Sprintf("/api/v1/project/%s/answers", projectID)
        req := httptest.NewRequest(http.MethodGet, path, nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)
        rec := httptest.NewRecorder()
        s.GetEcho().ServeHTTP(rec, req)

        if !assert.Equal(t, http.StatusOK, rec.Code) {
            t.Logf("Get answers response: %s", rec.Body.String())
            t.FailNow()
        }

        var answersResp struct {
            Answers []struct {
                ID         string `json:"id"`
                QuestionID string `json:"question_id"`
                Question   string `json:"question"`
                Answer     string `json:"answer"`
                Section    string `json:"section"`
            } `json:"answers"`
        }
        err := json.NewDecoder(rec.Body).Decode(&answersResp)
        assert.NoError(t, err)
        assert.NotEmpty(t, answersResp.Answers, "Should have questions to answer")

        // First patch each answer individually
        for _, q := range answersResp.Answers {
            var answer string
            switch q.Question {
            case "Company website":
                answer = "https://example.com"
            case "What is the core product or service, and what problem does it solve?":
                answer = "Our product is a blockchain-based authentication system that solves identity verification issues."
            case "What is the unique value proposition?":
                answer = "We provide secure, decentralized identity verification that's faster and more reliable than traditional methods."
            }

            // Patch the answer
            patchBody := map[string]string{
                "content":   answer,
                "answer_id": q.ID,
            }
            patchJSON, err := json.Marshal(patchBody)
            assert.NoError(t, err)

            patchReq := httptest.NewRequest(http.MethodPatch, path, bytes.NewReader(patchJSON))
            patchReq.Header.Set("Authorization", "Bearer "+accessToken)
            patchReq.Header.Set("Content-Type", "application/json")
            patchRec := httptest.NewRecorder()
            s.GetEcho().ServeHTTP(patchRec, patchReq)

            if !assert.Equal(t, http.StatusOK, patchRec.Code) {
                t.Logf("Patch answer response: %s", patchRec.Body.String())
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

    // Error cases
    t.Run("Error Cases", func(t *testing.T) {
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

                var errResp v1_common.APIError
                err := json.NewDecoder(rec.Body).Decode(&errResp)
                assert.NoError(t, err)
                assert.Contains(t, errResp.Message, tc.expectedError)
            })
        }
    })
}