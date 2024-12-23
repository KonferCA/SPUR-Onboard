package v1_auth

import (
	"KonferCA/SPUR/common"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

/*
Helper function that abstract away the different cookie configuration needed
based on the app environment for the refresh token cookie.
*/
func getRefreshTokenCookieConfig() *http.Cookie {
	cookie := &http.Cookie{
		Name: COOKIE_REFRESH_TOKEN,
		// this is a static path, that it should only be allowed in
		Path:     "/api/v1/auth/verify",
		Domain:   os.Getenv("URL_DOMAIN"),
		Secure:   os.Getenv("APP_ENV") != common.DEVELOPMENT_ENV,
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
	}

	if os.Getenv("APP_ENV") == common.DEVELOPMENT_ENV {
		cookie.SameSite = http.SameSiteLaxMode
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
