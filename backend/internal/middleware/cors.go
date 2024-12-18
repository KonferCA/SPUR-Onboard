package middleware

import (
	"KonferCA/SPUR/common"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	em "github.com/labstack/echo/v4/middleware"
)

/*
CORS is a wrapper middleware for the echo.CORS middleware.
The added feature of this wrapper is that it checks the app environment
and chooses the right configs to set. This allows a cleaner view
where the CORS middleware is declared.

Example:

	e := echo.New()
	e.Use(CORS())
*/
func CORS() echo.MiddlewareFunc {
	config := getCORSConfigByEnv()
	m := em.CORSWithConfig(config)
	return m
}

func getCORSConfigByEnv() em.CORSConfig {
	appEnv := os.Getenv("APP_ENV")

	switch appEnv {
	case common.DEVELOPMENT_ENV, common.TEST_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{"*"},
			AllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			AllowHeaders:                             []string{"*"},
			AllowCredentials:                         true,
			UnsafeWildcardOriginWithAllowCredentials: true,
		}
	case common.STAGING_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{"https://nk-staging.konfer.ca"},
			AllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			AllowHeaders:     []string{"*"},
			AllowCredentials: true,
		}
	case common.PREVIEW_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{"https://nk-dev.konfer.ca"},
			AllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodHead,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
				http.MethodOptions,
			},
			AllowHeaders:     []string{"*"},
			AllowCredentials: true,
		}
	}
	// production configuration is last to prevent situations
	// where the wrong APP_ENV was set for produciton.
	// In this order, at least production won't break.
	return em.CORSConfig{
		// TODO: We need to decide on a name and what will be the domain name
		// for the production deployment
		AllowOrigins: []string{"https://spur.konfer.ca"},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodHead,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}
}
