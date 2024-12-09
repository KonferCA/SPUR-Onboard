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

		var response SignupResponse
		err := json.NewDecoder(rec.Body).Decode(&response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.AccessToken)
		assert.Equal(t, payload.Email, response.User.Email)

		// Check refresh token cookie
		cookies := rec.Result().Cookies()
		var refreshCookie *http.Cookie
		for _, cookie := range cookies {
			if cookie.Name == "refresh_token" {
				refreshCookie = cookie
				break
			}
		}
		assert.NotNil(t, refreshCookie, "Refresh token cookie should be set")
		assert.True(t, refreshCookie.HttpOnly, "Cookie should be HTTP-only")
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

		var response SigninResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.AccessToken)
		assert.Equal(t, payload.Email, response.User.Email)

		// Check refresh token cookie
		cookies := rec.Result().Cookies()
		var refreshCookie *http.Cookie
		for _, cookie := range cookies {
			if cookie.Name == "refresh_token" {
				refreshCookie = cookie
				break
			}
		}
		assert.NotNil(t, refreshCookie, "Refresh token cookie should be set")
		assert.True(t, refreshCookie.HttpOnly, "Cookie should be HTTP-only")
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

	t.Run("email verified status", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified?email=test@example.com", nil)
		rec := httptest.NewRecorder()
		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response EmailVerifiedStatusResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.Nil(t, err)
		assert.False(t, response.Verified)
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
		tokenStr, err := jwt.GenerateVerifyEmailToken(token.Email, token.ID, exp)
		assert.Nil(t, err)
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		user, err = q.GetUserByEmail(ctx, "test@example.com")
		assert.Nil(t, err)
		assert.True(t, user.EmailVerified)
	})

	t.Run("email verified status - true", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified?email=test@example.com", nil)
		rec := httptest.NewRecorder()
		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response EmailVerifiedStatusResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.Nil(t, err)
		assert.True(t, response.Verified)
	})

	t.Run("email verified status - missing email query param", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified", nil)
		rec := httptest.NewRecorder()
		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	// test refresh token endpoint
	t.Run("refresh token", func(t *testing.T) {
		// First sign in to get a refresh token cookie
		signinPayload := SigninRequest{
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(signinPayload)

		signinReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signin", bytes.NewReader(body))
		signinReq.Header.Set("Content-Type", "application/json")
		signinRec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(signinRec, signinReq)
		assert.Equal(t, http.StatusOK, signinRec.Code)

		// Get the refresh token cookie
		cookies := signinRec.Result().Cookies()
		var refreshCookie *http.Cookie
		for _, cookie := range cookies {
			if cookie.Name == "refresh_token" {
				refreshCookie = cookie
				break
			}
		}
		assert.NotNil(t, refreshCookie, "Refresh token cookie should be set")
		assert.True(t, refreshCookie.HttpOnly, "Cookie should be HTTP-only")
		assert.True(t, refreshCookie.Secure, "Cookie should be secure")
		assert.Equal(t, http.SameSiteStrictMode, refreshCookie.SameSite, "Cookie should have strict same-site policy")
		assert.Equal(t, "/api/v1/auth", refreshCookie.Path, "Cookie should be limited to auth endpoints")

		// Test refresh endpoint
		refreshReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
		refreshReq.AddCookie(refreshCookie)
		refreshRec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(refreshRec, refreshReq)
		assert.Equal(t, http.StatusOK, refreshRec.Code)

		var refreshResponse map[string]string
		err := json.NewDecoder(refreshRec.Body).Decode(&refreshResponse)
		assert.NoError(t, err)
		assert.NotEmpty(t, refreshResponse["access_token"], "Should return new access token")

		// Verify new refresh token cookie is set
		newCookies := refreshRec.Result().Cookies()
		var newRefreshCookie *http.Cookie
		for _, cookie := range newCookies {
			if cookie.Name == "refresh_token" {
				newRefreshCookie = cookie
				break
			}
		}
		assert.NotNil(t, newRefreshCookie, "New refresh token cookie should be set")
		assert.NotEqual(t, refreshCookie.Value, newRefreshCookie.Value, "New refresh token should be different")
	})

	// test signout endpoint
	t.Run("signout", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signout", nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		// Check that refresh token cookie is cleared
		cookies := rec.Result().Cookies()
		var refreshCookie *http.Cookie
		for _, cookie := range cookies {
			if cookie.Name == "refresh_token" {
				refreshCookie = cookie
				break
			}
		}
		assert.NotNil(t, refreshCookie, "Refresh token cookie should be present")
		assert.Equal(t, "", refreshCookie.Value, "Cookie value should be empty")
		assert.True(t, refreshCookie.MaxAge < 0, "Cookie should be expired")
	})

	// test refresh with invalid token
	t.Run("refresh with invalid token", func(t *testing.T) {
		invalidCookie := &http.Cookie{
			Name:  "refresh_token",
			Value: "invalid-token",
		}
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
		req.AddCookie(invalidCookie)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	// test refresh without token
	t.Run("refresh without token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
		rec := httptest.NewRecorder()

		s.echoInstance.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})
}
