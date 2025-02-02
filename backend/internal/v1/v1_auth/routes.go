package v1_auth

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
)

/*
Sets up the V1 auth routes.
*/
func SetupAuthRoutes(e *echo.Group, s interfaces.CoreServer) {

	h := Handler{server: s}

	// 5 request per minute, get block for 15 minutes, and ban up to 1 hour after four blocks.
	// maxRequests := 5
	// if os.Getenv("APP_ENV") == common.TEST_ENV {
	// 	maxRequests = 5000
	// }

	// authLimiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
	// 	Requests:    maxRequests,
	// 	Window:      time.Minute,
	// 	BlockPeriod: time.Minute * 15,
	// 	MaxBlocks:   4,
	// })

	// e.POST("/auth/login", h.handleLogin)
	// e.GET(
	// 	"/auth/ami-verified",
	// 	h.handleEmailVerificationStatus,
	// 	middleware.Auth(s.GetDB(), permissions.PermSubmitProject),
	// )
	// e.GET("/auth/verify", h.handleVerifyCookie)
	// e.GET("/auth/verify-email", h.handleVerifyEmail, authLimiter.RateLimit())
	// e.POST("/auth/register", h.handleRegister, authLimiter.RateLimit())
	// e.POST("/auth/logout", h.handleLogout, authLimiter.RateLimit())

	e.POST("/auth/login", h.handleLogin)
	e.GET(
		"/auth/ami-verified",
		h.handleEmailVerificationStatus,
		middleware.Auth(s.GetDB(), permissions.PermSubmitProject),
	)
	e.POST("/auth/verify", h.handleVerifyCookie)
	e.GET("/auth/verify-email", h.handleVerifyEmail)
	e.POST("/auth/register", h.handleRegister)
	e.POST("/auth/logout", h.handleLogout)
}
