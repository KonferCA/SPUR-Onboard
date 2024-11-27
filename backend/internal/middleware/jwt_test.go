package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/KonferCA/NoKap/db"
	"github.com/KonferCA/NoKap/internal/jwt"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestProtectAPIForAccessToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "secret")
	e := echo.New()

	e.Use(ProtectAPI(jwt.ACCESS_TOKEN_TYPE))

	e.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// generate valid tokens
	userID := "user-id"
	role := db.UserRole("user-role")
	accessToken, refreshToken, err := jwt.Generate(userID, role)
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
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}

	// change jwt secret and generate new tokens
	os.Setenv("JWT_SECRET", "another-secret")
	accessToken, refreshToken, err = jwt.Generate(userID, role)
	assert.Nil(t, err)

	// reset secret
	os.Setenv("JWT_SECRET", "secret")

	tests = []struct {
		name         string
		expectedCode int
		token        string
	}{
		{
			name:         "Reject access token signed with wrong secret",
			expectedCode: http.StatusUnauthorized,
			token:        accessToken,
		},
		{
			name:         "Reject refresh token signed with wrong secret",
			expectedCode: http.StatusUnauthorized,
			token:        refreshToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}
}

func TestProtectAPIForRefreshToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "secret")
	e := echo.New()

	e.Use(ProtectAPI(jwt.REFRESH_TOKEN_TYPE))

	e.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// generate valid tokens
	userID := "user-id"
	role := db.UserRole("user-role")
	accessToken, refreshToken, err := jwt.Generate(userID, role)
	assert.Nil(t, err)

	tests := []struct {
		name         string
		expectedCode int
		token        string
	}{
		{
			name:         "Reject access token",
			expectedCode: http.StatusUnauthorized,
			token:        accessToken,
		},
		{
			name:         "Accept refresh token",
			expectedCode: http.StatusOK,
			token:        refreshToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}

	// change jwt secret and generate new tokens
	os.Setenv("JWT_SECRET", "another-secret")
	accessToken, refreshToken, err = jwt.Generate(userID, role)
	assert.Nil(t, err)

	// reset secret
	os.Setenv("JWT_SECRET", "secret")

	tests = []struct {
		name         string
		expectedCode int
		token        string
	}{
		{
			name:         "Reject access token signed with wrong secret",
			expectedCode: http.StatusUnauthorized,
			token:        accessToken,
		},
		{
			name:         "Reject refresh token signed with wrong secret",
			expectedCode: http.StatusUnauthorized,
			token:        refreshToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}
}
