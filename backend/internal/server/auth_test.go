package server

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

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
			Email:    "test@example.com",
			Password: "password123",
			Role:     "startup_owner",
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
			Email:    "test@example.com",
			Password: "password123",
			Role:     "startup_owner",
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

	t.Run("verify email", func(t *testing.T) {
		// taking a shortcut here
		// make use of the already created user before this test
		// we are going to directly fetch the user from the database here
		// to generate a new email token and verify that email verified is set to true
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
		defer cancel()
		q := db.New(s.DBPool)

		// since the signup test will trigger the creating of a new email token
		// when registration sends a verification email, we delete it here
		err := q.DeleteVerifyEmailTokenByEmail(ctx, "test@example.com")
		assert.Nil(t, err)

		user, err := q.GetUserByEmail(ctx, "test@example.com")
		assert.Nil(t, err)
		assert.False(t, user.EmailVerified)

		exp := time.Now().Add(time.Second * 30)
		token, err := q.CreateVerifyEmailToken(ctx, db.CreateVerifyEmailTokenParams{
			Email:     "test@example.com",
			ExpiresAt: exp,
		})
		assert.Nil(t, err)
		tokenStr, err := jwt.GenerateVerifyEmailToken(ctx, token.Email, token.ID, exp)
		assert.Nil(t, err)
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		user, err = q.GetUserByEmail(ctx, "test@example.com")
		assert.Nil(t, err)
		assert.True(t, user.EmailVerified)
	})
}
