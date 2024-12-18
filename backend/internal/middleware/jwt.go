package middleware

import (
	"net/http"
	"strings"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

// Auth creates a middleware that validates JWT access tokens with specified user roles
func Auth(dbPool *pgxpool.Pool, roles ...db.UserRole) echo.MiddlewareFunc {
	return AuthWithConfig(AuthConfig{
		AcceptTokenType: jwt.ACCESS_TOKEN_TYPE,
		AcceptUserRoles: roles,
	}, dbPool)
}

// AuthWithConfig creates a middleware with custom configuration for JWT validation
func AuthWithConfig(config AuthConfig, dbPool *pgxpool.Pool) echo.MiddlewareFunc {
	queries := db.New(dbPool)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// get the authorization header
			auth := c.Request().Header.Get(echo.HeaderAuthorization)
			if auth == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
			}

			// check bearer format
			parts := strings.Split(auth, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid authorization format")
			}

			// get user salt from db using claims
			claims, err := jwt.ParseUnverifiedClaims(parts[1])
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			// validate token type
			if claims.TokenType != config.AcceptTokenType {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token type")
			}

			// check if user role is allowed
			roleValid := false
			for _, role := range config.AcceptUserRoles {
				if claims.Role.Valid() && claims.Role == role {
					roleValid = true
					break
				}
			}
			if !roleValid {
				return echo.NewHTTPError(http.StatusForbidden, "insufficient permissions")
			}

			// get user's token salt and user data from db
			user, err := queries.GetUserByID(c.Request().Context(), claims.UserID)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			// verify token with user's salt
			claims, err = jwt.VerifyTokenWithSalt(parts[1], user.TokenSalt)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			// store claims and user in context for handlers
			c.Set("claims", &AuthClaims{
				JWTClaims: claims,
				Salt:      user.TokenSalt,
			})
			c.Set("user", &user)

			return next(c)
		}
	}
} 