package server

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuth(t *testing.T) {
	// setup test environment
	os.Setenv("JWT_SECRET", "test-secret")
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres")
	os.Setenv("DB_NAME", "postgres")
	os.Setenv("DB_SSLMODE", "disable")

	// create server
	s, err := New(true)
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	defer s.DBPool.Close()

	// clean up database before tests
	ctx := context.Background()
	_, err = s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
	if err != nil {
		t.Fatalf("failed to clean up database: %v", err)
	}

	// test signup
	t.Run("signup", func(t *testing.T) {
		payload := SignupRequest{
			Email:     "test@example.com",
			Password:  "password123",
			FirstName: "Test",
			LastName:  "User",
			Role:      "startup_owner",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signup", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusCreated, rec.Code)

		var response AuthResponse
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.AccessToken)
		assert.NotEmpty(t, response.RefreshToken)
		assert.Equal(t, payload.Email, response.User.Email)
	})

	// test duplicate email
	t.Run("duplicate email", func(t *testing.T) {
		payload := SignupRequest{
			Email:     "test@example.com",
			Password:  "password123",
			FirstName: "Test",
			LastName:  "User",
			Role:      "startup_owner",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signup", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusConflict, rec.Code)
	})

	// test signin
	t.Run("signin", func(t *testing.T) {
		payload := SigninRequest{
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signin", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response AuthResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.AccessToken)
		assert.NotEmpty(t, response.RefreshToken)
		assert.Equal(t, payload.Email, response.User.Email)
	})

	// test invalid credentials
	t.Run("invalid credentials", func(t *testing.T) {
		payload := SigninRequest{
			Email:    "test@example.com",
			Password: "wrongpassword",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signin", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})
}
