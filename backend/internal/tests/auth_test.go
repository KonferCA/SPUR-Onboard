package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_auth"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

// Custom validator
type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return err
	}
	return nil
}

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
	s.GetEcho().Validator = &CustomValidator{validator: validator.New()}

	// Create test user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("testpassword123"), bcrypt.DefaultCost)
	userID := uuid.New()
	testUser := db.User{
		ID:            userID.String(),
		Email:         "test@example.com",
		Password:      string(hashedPassword),
		Role:         db.UserRoleStartupOwner,
		EmailVerified: true,
		CreatedAt:     time.Now().Unix(),
		UpdatedAt:     time.Now().Unix(),
		TokenSalt:     []byte("test-salt"),
	}

	// Insert test user
	_, err = s.GetDB().Exec(context.Background(), `
		INSERT INTO users (id, email, password, role, email_verified, created_at, updated_at, token_salt)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, testUser.ID, testUser.Email, testUser.Password, testUser.Role, testUser.EmailVerified,
		testUser.CreatedAt, testUser.UpdatedAt, testUser.TokenSalt)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	t.Run("Login Endpoint", func(t *testing.T) {
		tests := []struct {
			name           string
			payload        v1_auth.LoginRequest
			expectedStatus int
			checkResponse  bool
		}{
			{
				name: "Valid Login",
				payload: v1_auth.LoginRequest{
					Email:    "test@example.com",
					Password: "testpassword123",
				},
				expectedStatus: http.StatusOK,
				checkResponse:  true,
			},
			{
				name: "Invalid Password",
				payload: v1_auth.LoginRequest{
					Email:    "test@example.com",
					Password: "wrongpassword",
				},
				expectedStatus: http.StatusUnauthorized,
				checkResponse:  false,
			},
			{
				name: "Invalid Email",
				payload: v1_auth.LoginRequest{
					Email:    "nonexistent@example.com",
					Password: "testpassword123",
				},
				expectedStatus: http.StatusUnauthorized,
				checkResponse:  false,
			},
			{
				name: "Invalid Email Format",
				payload: v1_auth.LoginRequest{
					Email:    "invalid-email",
					Password: "testpassword123",
				},
				expectedStatus: http.StatusBadRequest,
				checkResponse:  false,
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				// Create request
				jsonBody, _ := json.Marshal(tc.payload)
				req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
				req.Header.Set("Content-Type", "application/json")
				rec := httptest.NewRecorder()

				// Send request through the server
				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedStatus, rec.Code)

				if tc.checkResponse {
					var response v1_auth.LoginResponse
					err := json.Unmarshal(rec.Body.Bytes(), &response)
					assert.NoError(t, err)
					assert.NotEmpty(t, response.AccessToken)
					assert.Equal(t, tc.payload.Email, response.User.Email)
					assert.True(t, response.User.EmailVerified)
					assert.Equal(t, db.UserRoleStartupOwner, response.User.Role)

					// Verify cookie
					cookies := rec.Result().Cookies()
					var foundRefreshToken bool
					for _, cookie := range cookies {
						if cookie.Name == "token" {
							foundRefreshToken = true
							assert.True(t, cookie.HttpOnly)
							assert.True(t, cookie.Secure)
							assert.Equal(t, http.SameSiteStrictMode, cookie.SameSite)
						}
					}
					assert.True(t, foundRefreshToken)
				}
			})
		}
	})

	t.Run("Email Verification Status Endpoint", func(t *testing.T) {
		// Get user with token salt from DB
		user, err := db.New(s.GetDB()).GetUserByID(context.Background(), testUser.ID)
		assert.NoError(t, err)

		// Generate valid token for test user
		accessToken, _, err := jwt.GenerateWithSalt(user.ID, user.Role, user.TokenSalt)
		assert.NoError(t, err)

		tests := []struct {
			name           string
			setupAuth      func(req *http.Request)
			expectedStatus int
			expectedBody   map[string]interface{}
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
				expectedBody:   nil,
			},
			{
				name: "Invalid Token",
				setupAuth: func(req *http.Request) {
					req.Header.Set("Authorization", "Bearer invalid-token")
				},
				expectedStatus: http.StatusUnauthorized,
				expectedBody:   nil,
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified", nil)
				tc.setupAuth(req)
				rec := httptest.NewRecorder()

				// Send request through the server
				s.GetEcho().ServeHTTP(rec, req)

				assert.Equal(t, tc.expectedStatus, rec.Code)

				if tc.expectedBody != nil {
					resBodyBytes, err := io.ReadAll(rec.Body)
					assert.NoError(t, err)
					var response map[string]interface{}
					err = json.Unmarshal(resBodyBytes, &response)
					assert.NoError(t, err)
					assert.Equal(t, tc.expectedBody, response)
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
