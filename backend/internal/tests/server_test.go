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

	golangJWT "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/PuerkitoBio/goquery"
)

/*
This file contains blackbox testing for the server package which includes
all routes that are exposed by the server. The main objective is to test
that all routes are behaving how they should be from the perspective of
a client that doesn't know the inner implementation details.
*/
func TestServer(t *testing.T) {
	setupEnv()

	s, err := server.New()
	assert.Nil(t, err)

	// Add cleanup after all tests
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
		defer cancel()
		// Remove any test users that might be left
		_, err := s.DBPool.Exec(ctx, "DELETE FROM users WHERE email LIKE 'test-%@mail.com'")
		if err != nil {
			t.Logf("Failed to cleanup test users: %v", err)
		}
	})

	t.Run("Test API V1 Health Check Route", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
		rec := httptest.NewRecorder()
		s.GetEcho().ServeHTTP(rec, req)
		assert.Equal(t, rec.Code, http.StatusOK)
		resBytes, err := io.ReadAll(rec.Body)
		assert.Nil(t, err)
		var resBody map[string]any
		err = json.Unmarshal(resBytes, &resBody)
		assert.Nil(t, err)
		assert.Equal(t, resBody["status"], "healthy")
		assert.NotEmpty(t, resBody["timestamp"])
		assert.NotEmpty(t, resBody["database"])
		assert.NotEmpty(t, resBody["system"])
	})

	t.Run("Test API V1 Auth Routes", func(t *testing.T) {
		t.Run("/auth/ami-verified - 200 OK", func(t *testing.T) {
			email := fmt.Sprintf("test-ami-verified-%s@mail.com", uuid.New().String())
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()

			// create testuser
			userID := uuid.New()
			_, err = s.DBPool.Exec(ctx, `
                INSERT INTO users (
                    id,
                    email, 
                    password, 
                    role, 
                    email_verified, 
                    token_salt
                )
                VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))`,
				userID, email, "hashedpassword", db.UserRoleStartupOwner, true)
			if err != nil {
				t.Fatalf("failed to create test user: %v", err)
			}

			user, err := db.New(s.DBPool).GetUserByID(ctx, userID.String())
			assert.Nil(t, err)

			accessToken, _, err := jwt.GenerateWithSalt(userID.String(), user.Role, user.TokenSalt)
			assert.Nil(t, err)

			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/ami-verified", nil)
			req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", accessToken))
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			// read the response body
			resBodyBytes, err := io.ReadAll(rec.Body)
			assert.Nil(t, err)
			var resBody v1_auth.EmailVerifiedStatusResponse
			err = json.Unmarshal(resBodyBytes, &resBody)
			assert.Nil(t, err)

			assert.True(t, resBody.Verified)

			_, err = s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", email)
			if err != nil {
				t.Fatalf("failed to clean up test user: %v", err)
			}
		})

		t.Run("/api/v1/auth/register - 201 CREATED - successful registration", func(t *testing.T) {
			url := "/api/v1/auth/register"

			// create context with timeout of 1 minute.
			// tests should not hang for more than 1 minute.
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
			defer cancel()

			// create request body with unique email
			email := fmt.Sprintf("test-register-%s@mail.com", uuid.New().String())
			password := "mypassword"
			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, url, reader)
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusCreated, rec.Code)

			// read in the response body
			var resBody v1_auth.AuthResponse
			err = json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)

			t.Log(resBody)

			// make sure that the response body has all the expected fields
			// it should have the an access token
			assert.NotEmpty(t, resBody.AccessToken)
			assert.NotEmpty(t, resBody.User)

			// get the token salt of newly created user
			row := s.DBPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE email = $1;", email)
			var salt []byte
			err = row.Scan(&salt)
			assert.NoError(t, err)

			//  make sure it generated a valid access token by verifying it
			claims, err := jwt.VerifyTokenWithSalt(resBody.AccessToken, salt)
			assert.NoError(t, err)
			assert.Equal(t, claims.TokenType, jwt.ACCESS_TOKEN_TYPE)

			// make sure that the headers include the Set-Cookie
			cookies := rec.Result().Cookies()
			var refreshCookie *http.Cookie
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					refreshCookie = cookie
					break
				}
			}

			assert.NotNil(t, refreshCookie, "Refresh token cookie should be set.")
			if refreshCookie != nil {
				assert.True(t, refreshCookie.HttpOnly, "Cookie should be HTTP-only")
				assert.Equal(t, "/api/v1/auth/verify", refreshCookie.Path, "Cookie path should be /api")
				assert.NotEmpty(t, refreshCookie.Value, "Cookie should have refresh token string as value")
				// make sure the cookie value holds a valid refresh token
				claims, err := jwt.VerifyTokenWithSalt(refreshCookie.Value, salt)
				assert.NoError(t, err)
				assert.Equal(t, claims.TokenType, jwt.REFRESH_TOKEN_TYPE)
			}

			err = removeTestUser(ctx, email, s)
			assert.NoError(t, err)
		})

		t.Run("/api/v1/auth/register - 400 Bad Request - invalid body", func(t *testing.T) {
			url := "/api/v1/auth/register"

			// create request body
			email := "test"
			password := "short"
			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, url, reader)
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		})

		t.Run("/api/v1/auth/verify - 200 OK - valid cookie value", func(t *testing.T) {
			// create context with timeout of 1 minute.
			// tests should not hang for more than 1 minute.
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
			defer cancel()

			// create request body with unique email
			email := fmt.Sprintf("test-verify-%s@mail.com", uuid.New().String())
			password := "mypassword"

			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			// get cookie by normal means
			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", reader)
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusCreated, rec.Code)

			cookies := rec.Result().Cookies()
			var refreshCookie *http.Cookie
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					refreshCookie = cookie
					break
				}
			}

			assert.NotNil(t, refreshCookie)
			assert.Equal(t, refreshCookie.Name, v1_auth.COOKIE_REFRESH_TOKEN)

			// now we send a request to the actual route being tested
			// to see if the verification of the cookie works
			req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify", nil)
			req.AddCookie(refreshCookie)
			rec = httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			// read in the response body
			resBodyBytes, err := io.ReadAll(rec.Body)
			assert.NoError(t, err)
			var resBody v1_auth.AuthResponse
			err = json.Unmarshal(resBodyBytes, &resBody)
			assert.NoError(t, err)

			// the response body should include a new access token upon success
			assert.NotEmpty(t, resBody.AccessToken)
			assert.NotNil(t, resBody.User)

			// a new cookie value shouldn't be set since the refresh token hasn't expired yet
			cookies = rec.Result().Cookies()
			includesNewCookie := false
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					includesNewCookie = true
					break
				}
			}
			assert.False(t, includesNewCookie)

			err = removeTestUser(ctx, email, s)
			assert.NoError(t, err)
		})

		t.Run("/api/v1/auth/verify - 200 OK - about to expired valid cookie", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
			defer cancel()

			// Create unique email
			email := fmt.Sprintf("test-verify-expire-%s@mail.com", uuid.New().String())
			password := "testpassword123"

			// Register user first
			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", reader)
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()
			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusCreated, rec.Code)

			// Get user from database
			var user db.User
			err = s.DBPool.QueryRow(ctx, "SELECT id, role, token_salt FROM users WHERE email = $1", email).Scan(&user.ID, &user.Role, &user.TokenSalt)
			assert.NoError(t, err)

			// Create about-to-expire refresh token
			exp := time.Now().UTC().Add(2 * 24 * time.Hour)
			claims := jwt.JWTClaims{
				UserID:    user.ID,
				Role:      user.Role,
				TokenType: jwt.REFRESH_TOKEN_TYPE,
				RegisteredClaims: golangJWT.RegisteredClaims{
					ExpiresAt: golangJWT.NewNumericDate(exp),
					IssuedAt:  golangJWT.NewNumericDate(time.Now()),
				},
			}

			token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
			secret := append([]byte(os.Getenv("JWT_SECRET")), user.TokenSalt...)
			signed, err := token.SignedString(secret)
			assert.NoError(t, err)

			cookie := http.Cookie{
				Name:  v1_auth.COOKIE_REFRESH_TOKEN,
				Value: signed,
			}

			req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify", nil)
			req.AddCookie(&cookie)
			rec = httptest.NewRecorder()
			s.Echo.ServeHTTP(rec, req)

			assert.Equal(t, http.StatusOK, rec.Code)

			// Verify response
			var resBody v1_auth.AuthResponse
			err = json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.NotEmpty(t, resBody.AccessToken)

			// should include a new refresh token cookie
			cookies := rec.Result().Cookies()
			var refreshCookie *http.Cookie
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					refreshCookie = cookie
					break
				}
			}

			assert.NotNil(t, refreshCookie)
			assert.Equal(t, refreshCookie.Name, v1_auth.COOKIE_REFRESH_TOKEN)

			// Cleanup
			err = removeTestUser(ctx, email, s)
			assert.NoError(t, err)
		})

		t.Run("/api/v1/auth/verify - 401 UNAUTHORIZED - missing cookie in request", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify", nil)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		})

		t.Run("/api/v1/auth/verify - 401 UNAUTHORIZED - invalid cookie value", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
			defer cancel()

			// create new user to generate jwt
			userID, email, _, err := createTestUser(ctx, s)
			defer removeTestUser(ctx, email, s)

			// the refresh token will be invalid since the salt is different
			_, refreshToken, err := jwt.GenerateWithSalt(userID, db.UserRoleStartupOwner, []byte{0, 1, 2})
			assert.NoError(t, err)

			cookie := http.Cookie{
				Name:  v1_auth.COOKIE_REFRESH_TOKEN,
				Value: refreshToken,
			}
			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify", nil)
			req.AddCookie(&cookie)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		})

		t.Run("/api/v1/auth/verify - 401 UNAUTHORIZED - invalid cookie", func(t *testing.T) {
			cookie := http.Cookie{
				Name:  v1_auth.COOKIE_REFRESH_TOKEN,
				Value: "invalid-refresh-token",
			}
			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify", nil)
			req.AddCookie(&cookie)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		})

		t.Run("/auth/verify-email - 200 OK - valid email token", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()

			// Create user with unique email
			email := fmt.Sprintf("test-verify-email-%s@mail.com", uuid.New().String())
			password := "testpassword123"

			// Register user first
			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", reader)
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()
			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusCreated, rec.Code)

			// Get user from database
			var user db.User
			err = s.DBPool.QueryRow(ctx, "SELECT id FROM users WHERE email = $1", email).Scan(&user.ID)
			assert.NoError(t, err)

			// Generate test email token
			exp := time.Now().Add(time.Minute * 30).UTC()
			tokenID, err := createTestEmailToken(ctx, user.ID, exp, s)
			assert.Nil(t, err)
			tokenStr, err := jwt.GenerateVerifyEmailToken(email, tokenID, exp)
			assert.Nil(t, err)

			req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
			rec = httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			doc, err := goquery.NewDocumentFromReader(rec.Body)
			assert.NoError(t, err)
			title := doc.Find(`[data-testid="card-title"]`).Text()
			assert.Equal(t, title, "Email Verified Successfully")
			details := doc.Find(`[data-testid="card-details"]`).Text()
			assert.Contains(t, details, "Thank you for verifying your email address")
			icon := doc.Find(`[data-testid="check-icon"]`)
			assert.Equal(t, 1, icon.Length())
			button := doc.Find(`[data-testid="go-to-dashboard"]`)
			assert.Equal(t, 1, button.Length())

			// Cleanup
			err = removeTestUser(ctx, email, s)
			assert.NoError(t, err)
		})

		t.Run("/auth/verify-email - missing token query parameter", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify-email", nil)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			doc, err := goquery.NewDocumentFromReader(rec.Body)
			assert.NoError(t, err)
			title := doc.Find(`[data-testid="card-title"]`).Text()
			assert.Equal(t, title, "Failed to Verify Email")
			details := doc.Find(`[data-testid="card-details"]`).Text()
			assert.Contains(t, details, "Missing validation token")
			icon := doc.Find(`[data-testid="x-icon"]`)
			assert.Equal(t, 1, icon.Length())
			button := doc.Find(`[data-testid="go-to-dashboard"]`)
			assert.Equal(t, 1, button.Length())
		})

		t.Run("/auth/verify-email - deny expired email token", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()

			userID, email, _, err := createTestUser(ctx, s)
			assert.NoError(t, err)

			// Generate expired email token using helper
			exp := time.Now().Add(-(time.Minute * 30)).UTC()
			tokenID, err := createTestEmailToken(ctx, userID, exp, s)
			assert.Nil(t, err)
			tokenStr, err := jwt.GenerateVerifyEmailToken(email, tokenID, exp)
			assert.Nil(t, err)

			// Test the expired token
			req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
			rec := httptest.NewRecorder()
			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			doc, err := goquery.NewDocumentFromReader(rec.Body)
			assert.NoError(t, err)
			title := doc.Find(`[data-testid="card-title"]`).Text()
			assert.Equal(t, title, "Failed to Verify Email")
			details := doc.Find(`[data-testid="card-details"]`).Text()
			assert.Contains(t, details, "The verification link is invalid or expired")
			icon := doc.Find(`[data-testid="x-icon"]`)
			assert.Equal(t, 1, icon.Length())
			button := doc.Find(`[data-testid="go-to-dashboard"]`)
			assert.Equal(t, 1, button.Length())

			// Cleanup
			err = removeTestUser(ctx, email, s)
			assert.NoError(t, err)
		})

		t.Run("/api/v1/auth/logout - 200 OK - successfully logout", func(t *testing.T) {
			// Register user with unique email
			email := fmt.Sprintf("test-logout-%s@mail.com", uuid.New().String())
			password := "testpassword123"
			authReq := v1_auth.AuthRequest{
				Email:    email,
				Password: password,
			}
			data, err := json.Marshal(authReq)
			assert.NoError(t, err)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(data))
			req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusCreated, rec.Code)

			// get the cookie
			cookies := rec.Result().Cookies()
			var tokenCookie *http.Cookie
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					tokenCookie = cookie
					break
				}
			}
			if tokenCookie == nil {
				t.Fatal("Refresh token cookie not found")
			}
			assert.NoError(t, err)
			assert.NotNil(t, tokenCookie)
			assert.NotEmpty(t, tokenCookie.Value)

			req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
			req.AddCookie(tokenCookie)
			rec = httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)

			assert.Equal(t, http.StatusOK, rec.Code)

			// make sure the cookie value has been unset
			tokenCookie = nil
			cookies = rec.Result().Cookies()
			for _, cookie := range cookies {
				if cookie.Name == v1_auth.COOKIE_REFRESH_TOKEN {
					tokenCookie = cookie
					break
				}
			}
			if tokenCookie == nil {
				t.Fatal("Refresh token cookie not found")
			}
			assert.NoError(t, err)
			assert.NotNil(t, tokenCookie)
			assert.Empty(t, tokenCookie.Value)
			// make sure the expiration date is less than right now
			// and max-age is negative to indicate the browser to remove the cookie
			assert.True(t, time.Now().After(tokenCookie.Expires))
			assert.Equal(t, -1, tokenCookie.MaxAge)
		})
	})
}
