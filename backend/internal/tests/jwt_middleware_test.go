package tests

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
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

	// Create a test user directly in the database
	userID := uuid.New()
	_, err = dbPool.Exec(ctx, `
		INSERT INTO users (
			id, 
			email, 
			password, 
			role, 
			email_verified, 
			token_salt
		)
		VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
	`, userID, "test@example.com", "hashedpassword", db.UserRoleStartupOwner, true)
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	// Create Echo instance with the middleware
	e := echo.New()
	middlewareConfig := middleware.AuthConfig{
		AcceptTokenType: jwt.ACCESS_TOKEN_TYPE,
		AcceptUserRoles: []db.UserRole{db.UserRoleStartupOwner},
	}
	e.Use(middleware.AuthWithConfig(middlewareConfig, dbPool))

	e.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// Get user's salt from database
	var salt []byte
	err = dbPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", userID).Scan(&salt)
	if err != nil {
		t.Fatalf("failed to get user salt: %v", err)
	}

	// generate valid tokens using the actual salt
	accessToken, refreshToken, err := jwt.GenerateWithSalt(userID.String(), db.UserRoleStartupOwner, salt)
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
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}

	// Clean up test user after test
	_, err = dbPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up test user: %v", err)
	}
}