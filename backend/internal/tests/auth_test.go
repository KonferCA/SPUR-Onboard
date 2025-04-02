package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_auth"
	"KonferCA/SPUR/internal/v1/v1_common"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthEndpoints(t *testing.T) {
	// Setup test environment
	setupEnv()

	// Additional required env vars
	os.Setenv("JWT_SECRET", "test-secret-key")

	// Initialize server
	s, err := server.New()
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}

	// Set up validator
	s.GetEcho().Validator = middleware.NewRequestValidator()

	// Create test user with permissions
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("TestPassword123!"), bcrypt.DefaultCost)
	userID := uuid.New()
	testUser := db.User{
		ID:            userID.String(),
		Email:         "test@example.com",
		Password:      string(hashedPassword),
		Permissions:   int32(permissions.PermSubmitProject | permissions.PermManageTeam),
		EmailVerified: true,
		CreatedAt:     time.Now().Unix(),
		UpdatedAt:     time.Now().Unix(),
		TokenSalt:     []byte("test-salt"),
	}

	// Insert test user
	_, err = s.GetDB().Exec(context.Background(), `
        INSERT INTO users (id, email, password, permissions, email_verified, created_at, updated_at, token_salt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, testUser.ID, testUser.Email, testUser.Password, testUser.Permissions,
		testUser.EmailVerified, testUser.CreatedAt, testUser.UpdatedAt, testUser.TokenSalt)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	t.Run("Login Endpoint", func(t *testing.T) {
		tests := []struct {
			name           string
			payload        v1_auth.AuthRequest
			expectedStatus int
			checkResponse  bool
			expectedError  *struct {
				errorType    v1_common.ErrorType
				errorMessage string
			}
		}{
			{
				name: "Valid Login",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "TestPassword123!",
				},
				expectedStatus: http.StatusOK,
				checkResponse:  true,
			},
			{
				name: "Invalid Password",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "WrongPassword123!",
				},
				expectedStatus: http.StatusUnauthorized,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeAuth,
					errorMessage: "Invalid email or password",
				},
			},
			{
				name: "Invalid Email",
				payload: v1_auth.AuthRequest{
					Email:    "nonexistent@example.com",
					Password: "TestPassword123!",
				},
				expectedStatus: http.StatusUnauthorized,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeAuth,
					errorMessage: "Invalid email or password",
				},
			},
			{
				name: "Invalid Email Format",
				payload: v1_auth.AuthRequest{
					Email:    "invalid-email",
					Password: "TestPassword123!",
				},
				expectedStatus: http.StatusBadRequest,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeBadRequest,
					errorMessage: "Validation failed",
				},
			},
			{
				name: "Password Missing Uppercase",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "password123!",
				},
				expectedStatus: http.StatusBadRequest,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeBadRequest,
					errorMessage: "Validation failed",
				},
			},
			{
				name: "Password Missing Number",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "Password!",
				},
				expectedStatus: http.StatusBadRequest,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeBadRequest,
					errorMessage: "Validation failed",
				},
			},
			{
				name: "Password Missing Special Character",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "Password123",
				},
				expectedStatus: http.StatusBadRequest,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeBadRequest,
					errorMessage: "Validation failed",
				},
			},
			{
				name: "Password Too Short",
				payload: v1_auth.AuthRequest{
					Email:    "test@example.com",
					Password: "Pas1!",
				},
				expectedStatus: http.StatusBadRequest,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeBadRequest,
					errorMessage: "Validation failed",
				},
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				jsonBody, _ := json.Marshal(tc.payload)
				req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
				req.Header.Set("Content-Type", "application/json")
				rec := httptest.NewRecorder()

				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedStatus, rec.Code)

				if tc.checkResponse {
					var response v1_auth.AuthResponse
					err := json.Unmarshal(rec.Body.Bytes(), &response)
					assert.NoError(t, err)
					assert.NotEmpty(t, response.AccessToken)
					assert.Equal(t, tc.payload.Email, response.User.Email)
					assert.True(t, response.User.EmailVerified)
					assert.Equal(t, permissions.PermSubmitProject|permissions.PermManageTeam, response.User.Permissions)

					// Verify cookie
					cookies := rec.Result().Cookies()
					var foundRefreshToken bool
					for _, cookie := range cookies {
						if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
							foundRefreshToken = true
							assert.True(t, cookie.HttpOnly)
							assert.True(t, cookie.Secure)
							assert.Equal(t, http.SameSiteStrictMode, cookie.SameSite)
							assert.Equal(t, "/api/v1/", cookie.Path)
						}
					}
					assert.True(t, foundRefreshToken)
				} else if tc.expectedError != nil {
					var errResp v1_common.APIError
					err := json.NewDecoder(rec.Body).Decode(&errResp)
					assert.NoError(t, err)
					assert.Equal(t, tc.expectedError.errorType, errResp.Type)
					assert.Contains(t, errResp.Message, tc.expectedError.errorMessage)
				}
			})
		}
	})

	t.Run("Email Verification Status Endpoint", func(t *testing.T) {
		// Get user with token salt from DB
		user, err := db.New(s.GetDB()).GetUserByID(context.Background(), testUser.ID)
		assert.NoError(t, err)

		// Generate tokens for test
		accessToken, _, err := jwt.GenerateWithSalt(user.ID, user.TokenSalt)
		assert.NoError(t, err)

		tests := []struct {
			name           string
			setupAuth      func(req *http.Request)
			expectedStatus int
			expectedBody   map[string]interface{}
			expectedError  *struct {
				errorType    v1_common.ErrorType
				errorMessage string
			}
		}{
			{
				name: "Valid Token",
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
				},
				expectedStatus: http.StatusOK,
				expectedBody: map[string]interface{}{
					"verified": true,
				},
			},
			{
				name: "No Token",
				setupAuth: func(req *http.Request) {
					// No auth header
				},
				expectedStatus: http.StatusUnauthorized,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeAuth,
					errorMessage: "missing authorization header",
				},
			},
			{
				name: "Invalid Token",
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer invalid-token")
				},
				expectedStatus: http.StatusUnauthorized,
				expectedError: &struct {
					errorType    v1_common.ErrorType
					errorMessage string
				}{
					errorType:    v1_common.ErrorTypeAuth,
					errorMessage: "invalid token",
				},
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified", nil)
				tc.setupAuth(req)
				rec := httptest.NewRecorder()

				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedStatus, rec.Code)

				if tc.expectedBody != nil {
					var response map[string]interface{}
					err := json.NewDecoder(rec.Body).Decode(&response)
					assert.NoError(t, err)
					assert.Equal(t, tc.expectedBody, response)
				} else if tc.expectedError != nil {
					var errResp v1_common.APIError
					err := json.NewDecoder(rec.Body).Decode(&errResp)
					assert.NoError(t, err)
					assert.Equal(t, tc.expectedError.errorType, errResp.Type)
					assert.Equal(t, tc.expectedError.errorMessage, errResp.Message)
				}
			})
		}
	})

	// Cleanup
	_, err = s.GetDB().Exec(context.Background(), "DELETE FROM users WHERE id = $1", testUser.ID)
	if err != nil {
		t.Fatalf("Failed to cleanup test user: %v", err)
	}
}
