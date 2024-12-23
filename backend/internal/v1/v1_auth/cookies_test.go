package v1_auth

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGetRefreshTokenCookieConfig(t *testing.T) {
	original := os.Getenv("URL_DOMAIN")
	os.Setenv("URL_DOMAIN", "localhost")
	defer func() { os.Setenv("URL_DOMAIN", original) }()

	config := getRefreshTokenCookieConfig()
	// 1 is added to account for the time taken to reach this point
	assert.True(t, time.Now().UTC().Add(24*7*time.Hour+1).After(config.Expires))
	assert.Equal(t, COOKIE_REFRESH_TOKEN, config.Name)
	assert.Equal(t, "/api/v1/auth/verify", config.Path)
	assert.Equal(t, "localhost", config.Domain)
	assert.True(t, config.Secure)
	assert.True(t, config.HttpOnly)
	assert.Equal(t, 7*24*60*60, config.MaxAge)
	assert.Equal(t, http.SameSiteStrictMode, config.SameSite)
}

func TestSetRefreshTokenCookie(t *testing.T) {
	original := os.Getenv("URL_DOMAIN")
	os.Setenv("URL_DOMAIN", "localhost")
	defer func() { os.Setenv("URL_DOMAIN", original) }()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	e.GET("/", func(c echo.Context) error {
		setRefreshTokenCookie(c, "some value")
		return c.NoContent(http.StatusOK)
	})

	e.ServeHTTP(rec, req)

	cookies := rec.Result().Cookies()
	var tokenCookie *http.Cookie
	for _, cookie := range cookies {
		if cookie.Name == COOKIE_REFRESH_TOKEN {
			tokenCookie = cookie
			break
		}
	}

	assert.NotNil(t, tokenCookie)
	// 1 is added to account for the time taken to reach this point
	assert.True(t, time.Now().UTC().Add(24*7*time.Hour+1).After(tokenCookie.Expires))
	assert.Equal(t, COOKIE_REFRESH_TOKEN, tokenCookie.Name)
	assert.Equal(t, "some value", tokenCookie.Value)
	assert.Equal(t, "/api/v1/auth/verify", tokenCookie.Path)
	assert.Equal(t, "localhost", tokenCookie.Domain)
	assert.True(t, tokenCookie.Secure)
	assert.True(t, tokenCookie.HttpOnly)
	assert.Equal(t, 7*24*60*60, tokenCookie.MaxAge)
	assert.Equal(t, http.SameSiteStrictMode, tokenCookie.SameSite)
}
