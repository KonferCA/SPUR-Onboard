package v1_auth

import (
	"KonferCA/SPUR/common"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
)

/*
Helper function that abstract away the different cookie configuration needed
based on the app environment for the refresh token cookie.
*/
func getRefreshTokenCookieConfig() *http.Cookie {
	exp := time.Now().UTC().Add(24 * 7 * time.Hour)
	cookie := &http.Cookie{
		Name: COOKIE_REFRESH_TOKEN,
		// this is a static path, that it should only be allowed in
		Path:     "/api/v1/",
		Domain:   os.Getenv("URL_DOMAIN"),
		Secure:   os.Getenv("APP_ENV") != common.DEVELOPMENT_ENV,
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
		Expires:  exp,
		// Max-Age set to 7 days in seconds
		MaxAge: 7 * 24 * 60 * 60,
	}

	if os.Getenv("APP_ENV") == common.DEVELOPMENT_ENV {
		cookie.SameSite = http.SameSiteLaxMode
		// only for dev!!!
		cookie.Secure = false
		cookie.Domain = "localhost"
	}

	return cookie
}

/*
Sets the refresh token cookie in the given context with the value.
*/
func setRefreshTokenCookie(c echo.Context, value string) {
	cookie := getRefreshTokenCookieConfig()
	cookie.Value = value
	c.SetCookie(cookie)
}

/*
Unsets the refresh token cookie. Make the right configuration
that tells the browser to remove the cookie.
*/
func unsetRefreshTokenCookie(c echo.Context) {
	cookie := getRefreshTokenCookieConfig()
	cookie.Value = ""
	// expires and max-age tells the browser to remove the cookie
	cookie.Expires = time.Now().UTC()
	cookie.MaxAge = -1
	c.SetCookie(cookie)
}
