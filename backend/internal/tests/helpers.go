package tests

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

/*
Creates a simple test user in the database with specified permissions. Remember to remove the test user with removeTestUser().

The function returns userID, email, password, error
*/
func createTestUser(ctx context.Context, s *server.Server, perms uint32) (string, string, string, error) {
	userID := uuid.New().String()
	email := fmt.Sprintf("test-%s@example.com", uuid.New().String())
	password := "testpassword123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	_, err := s.GetDB().Exec(ctx, `
		INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
		VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
	`, userID, email, string(hashedPassword), int32(perms), true)

	return userID, email, password, err
}

/*
Helper function that queries the token_salt of a test user with email.
*/
func getTestUserTokenSalt(ctx context.Context, email string, s *server.Server) ([]byte, error) {
	row := s.DBPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE email = $1;", email)
	var salt []byte
	err := row.Scan(&salt)
	return salt, err
}

/*
Simple wrapper with SQL to remove a user from the database. Ideally, you want to use this
only for the test user created by the function createTestUser()
*/
func removeTestUser(ctx context.Context, email string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", email)
	return err
}

/*
Simple helper function that creates a test email token. Remember to call removeTestEmailToken()
if the test doesn't remove it by default, such as the verify email handler.
*/
func createTestEmailToken(ctx context.Context, userID string, exp time.Time, s *server.Server) (string, error) {
	row := s.DBPool.QueryRow(ctx, `
        INSERT INTO verify_email_tokens (
            user_id, 
            expires_at
        )
        VALUES ($1, $2) RETURNING id;`,
		userID, exp.Unix())
	var tokenID string
	err := row.Scan(&tokenID)
	return tokenID, err
}

/*
Simple wrapper that removes the test email token. Only call this function if the
token hasn't been removed by other functions.
*/
func removeEmailToken(ctx context.Context, tokenID string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM verify_email_tokens WHERE id = $1", tokenID)
	return err
}

/*
Creates a test company for the given user. Remember to clean up after tests.
Returns companyID, error
*/
func createTestCompany(ctx context.Context, s *server.Server, userID string) (string, error) {
	companyID := uuid.New().String()

	_, err := s.DBPool.Exec(ctx, `
		INSERT INTO companies (
			id,
			name,
			wallet_address,
			linkedin_url,
			owner_id
		)
		VALUES ($1, $2, $3, $4, $5)`,
		companyID, "Test Company", "0x123", "https://linkedin.com/test", userID)

	return companyID, err
}

/*
Removes a test company from the database.
*/
func removeTestCompany(ctx context.Context, companyID string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM companies WHERE id = $1", companyID)
	return err
}

func createTestAdmin(ctx context.Context, s *server.Server) (string, string, string, error) {
	// Create admin user with all permissions
	perms := permissions.PermAdmin | permissions.PermManageUsers | permissions.PermViewAllProjects |
		permissions.PermManageTeam | permissions.PermCommentOnProjects | permissions.PermSubmitProject | permissions.PermIsAdmin

	// Generate random email and password
	email := fmt.Sprintf("admin_%s@test.com", uuid.New().String())
	password := "test_password"

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	userID := uuid.New().String()
	_, err = s.GetDB().Exec(ctx, `
		INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
		VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
	`, userID, email, string(hashedPassword),
		int32(perms), true)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to create admin user: %w", err)
	}

	return userID, email, password, nil
}

func loginAndGetToken(t *testing.T, s *server.Server, email, password string) string {
	loginBody := fmt.Sprintf(`{"email":"%s","password":"%s"}`, email, password)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(loginBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	s.GetEcho().ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code, "Login should succeed")

	var loginResp map[string]interface{}
	err := json.NewDecoder(rec.Body).Decode(&loginResp)
	assert.NoError(t, err, "Should decode login response")

	accessToken, ok := loginResp["access_token"].(string)
	assert.True(t, ok, "Response should contain access_token")
	assert.NotEmpty(t, accessToken, "Access token should not be empty")

	return accessToken
}

func generateTestToken(t *testing.T, userID string, perms uint32, salt []byte) string {
	token, _, err := jwt.GenerateWithSalt(userID, salt)
	require.NoError(t, err)
	return token
}
