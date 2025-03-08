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
	fe_url := os.Getenv("FRONTEND_URL")

	allowMethods := []string{
		http.MethodGet,
		http.MethodPost,
		http.MethodHead,
		http.MethodPut,
		http.MethodPatch,
		http.MethodDelete,
		http.MethodOptions,
	}

	allowHeaders := []string{
		"Accept",
		"Authorization",
		"Content-Type",
		"X-CSRF-Token",
		"X-Requested-With",
	}

	switch appEnv {
	case common.DEVELOPMENT_ENV, common.TEST_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"https://spuric.com",
				"http://spuric.com",
				"https://konfer.ca",
				"http://konfer.ca",
				fe_url,
			},
			AllowMethods:     allowMethods,
			AllowHeaders:     allowHeaders,
			AllowCredentials: true,
			MaxAge:           300,
		}
	case common.STAGING_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"https://spuric.com",
				"http://spuric.com",
				"https://konfer.ca",
				"http://konfer.ca",
				fe_url,
			},
			AllowMethods:     allowMethods,
			AllowHeaders:     allowHeaders,
			AllowCredentials: true,
			MaxAge:           300,
		}
	case common.PREVIEW_ENV:
		return em.CORSConfig{
			AllowOrigins: []string{
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"https://spuric.com",
				"http://spuric.com",
				"https://konfer.ca",
				"http://konfer.ca",
				fe_url,
			},
			AllowMethods:     allowMethods,
			AllowHeaders:     allowHeaders,
			AllowCredentials: true,
			MaxAge:           300,
		}
	}

	// production configuration is last to prevent situations
	// where the wrong APP_ENV was set for produciton.
	// In this order, at least production won't break.
	return em.CORSConfig{
		AllowOrigins: []string{
			fe_url,
			"https://spuric.com",
			"http://spuric.com",
			"https://konfer.ca",
			"http://konfer.ca",
		},
		AllowMethods:     allowMethods,
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	}
}
