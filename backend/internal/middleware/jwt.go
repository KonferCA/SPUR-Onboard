package middleware

import (
	"net/http"
	"strings"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

// Auth creates a middleware that validates JWT tokens from the Authorization header
func Auth(config AuthConfig, dbPool *pgxpool.Pool) echo.MiddlewareFunc {
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
			user, err := dbPool.GetUserByID(c.Request().Context(), claims.UserID)
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