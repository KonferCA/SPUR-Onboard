package tests

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
)

func TestJWTMiddleware(t *testing.T) {
	// setup test environment
	setupEnv()
	os.Setenv("JWT_SECRET", "secret")

	// Connect to test database
	ctx := context.Background()
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	dbPool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Clean up any existing test user
	_, err = dbPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up test user: %v", err)
	}

	// Create a test user with permissions
	userID := uuid.New()
	_, err = dbPool.Exec(ctx, `
		INSERT INTO users (
			id, 
			email, 
			password, 
			permissions, 
			email_verified, 
			token_salt
		)
		VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
	`, userID, "test@example.com", "hashedpassword", 
		int32(permissions.PermSubmitProject|permissions.PermManageTeam), true)
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	// Create Echo instance with the middleware
	s, err := server.New()
	assert.NoError(t, err)
	middlewareConfig := middleware.AuthConfig{
		AcceptTokenType: jwt.ACCESS_TOKEN_TYPE,
		RequiredPermissions: []uint32{permissions.PermSubmitProject},
	}
	s.Echo.Use(middleware.AuthWithConfig(middlewareConfig, dbPool))

	s.Echo.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// Get user's salt from database
	var salt []byte
	err = dbPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", userID).Scan(&salt)
	if err != nil {
		t.Fatalf("failed to get user salt: %v", err)
	}

	// generate valid tokens using permissions instead of role
	accessToken, refreshToken, err := jwt.GenerateWithSalt(userID.String(), 
		uint32(permissions.PermSubmitProject|permissions.PermManageTeam), salt)
	assert.Nil(t, err)

	tests := []struct {
		name         string
		expectedCode int
		token        string
	}{
		{
			name:         "Accept access token",
			expectedCode: http.StatusOK,
			token:        accessToken,
		},
		{
			name:         "Reject refresh token",
			expectedCode: http.StatusUnauthorized,
			token:        refreshToken,
		},
		{
			name:         "Reject invalid token format",
			expectedCode: http.StatusUnauthorized,
			token:        "invalid-token",
		},
		{
			name:         "Reject empty token",
			expectedCode: http.StatusUnauthorized,
			token:        "",
		},
		{
			name:         "Reject token with invalid signature",
			expectedCode: http.StatusUnauthorized,
			token:        accessToken + "tampered",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			if test.token != "" {
				req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			}
			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}

	// Clean up test user after test
	_, err = dbPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up test user: %v", err)
	}
}

