package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_auth"
  "KonferCA/SPUR/internal/v1/v1_common"
  
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
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
			email := "test@mail.com"
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()

			// create test user
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

			// create request body
			email := "test@mail.com"
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

		t.Run("/api/v1/auth/register - 400 Bad Request - existing user", func(t *testing.T) {
			url := "/api/v1/auth/register"

			// create context with timeout of 1 minute.
			// tests should not hang for more than 1 minute.
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
			defer cancel()

			// seed with test user
			_, email, password, err := createTestUser(ctx, s)
			assert.NoError(t, err)
			defer removeTestUser(ctx, email, s)

			reqBody := map[string]string{
				"email":    email,
				"password": password,
			}
			reqBodyBytes, err := json.Marshal(reqBody)
			assert.NoError(t, err)

			reader := bytes.NewReader(reqBodyBytes)
			req := httptest.NewRequest(http.MethodPost, url, reader)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusBadRequest, rec.Code)
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

		t.Run("/auth/verify-email - 200 OK - valid email token", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()
			userID, email, _, err := createTestUser(ctx, s)
			assert.Nil(t, err)
			defer removeTestUser(ctx, email, s)

			// generate a test email token
			exp := time.Now().Add(time.Minute * 30).UTC()
			tokenID, err := createTestEmailToken(ctx, userID, exp, s)
			assert.Nil(t, err)
			tokenStr, err := jwt.GenerateVerifyEmailToken(email, tokenID, exp)
			assert.Nil(t, err)

			req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)
			assert.Equal(t, http.StatusOK, rec.Code)

			resBodyBytes, err := io.ReadAll(rec.Body)
			assert.Nil(t, err)

			var resBody map[string]any
			err = json.Unmarshal(resBodyBytes, &resBody)
			assert.Nil(t, err)
			assert.Equal(t, resBody["verified"], true)
		})

		t.Run("/auth/verify-email - 400 Bad Request - missing token query parameter", func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/verify-email", nil)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)

			var apiErr v1_common.APIError
			err := json.NewDecoder(rec.Body).Decode(&apiErr)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusBadRequest, rec.Code)
			assert.Equal(t, v1_common.ErrorTypeBadRequest, apiErr.Type)
			assert.Equal(t, "Missing required query parameter: 'token'", apiErr.Message)
		})

		t.Run("/auth/verify-email - 400 Bad Request - deny expired email token", func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
			defer cancel()
			userID, email, _, err := createTestUser(ctx, s)
			assert.Nil(t, err)
			defer removeTestUser(ctx, email, s)

			exp := time.Now().Add(-(time.Minute * 30)).UTC()
			tokenID, err := createTestEmailToken(ctx, userID, exp, s)
			assert.Nil(t, err)
			tokenStr, err := jwt.GenerateVerifyEmailToken(email, tokenID, exp)
			assert.Nil(t, err)

			req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/auth/verify-email?token=%s", tokenStr), nil)
			rec := httptest.NewRecorder()

			s.Echo.ServeHTTP(rec, req)

			var apiErr v1_common.APIError
			err = json.NewDecoder(rec.Body).Decode(&apiErr)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusBadRequest, rec.Code)
			assert.Equal(t, v1_common.ErrorTypeBadRequest, apiErr.Type)
			assert.Equal(t, "Failed to verify email. Invalid or expired token.", apiErr.Message)
		})
	})
}
