package middleware

import (
	"net/http"
	"strings"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

const JWT_CLAIMS = "MIDDLEWARE_JWT_CLAIMS"

// Middleware that validates the JWT token from either cookie or Authorization header
func ProtectAPI(acceptTokenType string, queries *db.Queries) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			var tokenString string

			// first try to get token from cookie
			cookie, err := c.Cookie("token")
			if err == nil {
				tokenString = cookie.Value
			} else {
				// fallback to Authorization header
				auth := c.Request().Header.Get(echo.HeaderAuthorization)
				if auth == "" {
					return echo.NewHTTPError(http.StatusUnauthorized, "No authentication token found")
				}
				
				parts := strings.Split(auth, " ")
				if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
					return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authorization header. Only accept Bearer token.")
				}
				tokenString = parts[1]
			}

			// Step 1: Parse claims without verification to get userID
			unverifiedClaims, err := jwt.ParseUnverifiedClaims(tokenString)
			if err != nil {
				log.Error().Err(err).Msg("Failed to parse JWT claims")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token format")
			}

			// Step 2: Get user's salt
			salt, err := queries.GetUserTokenSalt(c.Request().Context(), unverifiedClaims.UserID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to get user's token salt")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
			}

			// Step 3: Verify token with salt
			claims, err := jwt.VerifyTokenWithSalt(tokenString, salt)
			if err != nil {
				log.Error().Err(err).Msg("JWT verification error")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
			}

			// Step 4: Verify token type
			if acceptTokenType != claims.TokenType {
				log.Error().Str("accept", acceptTokenType).Str("received", claims.TokenType).Msg("Invalid token type")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token type")
			}

			// Get user from database and set in context
			user, err := queries.GetUserByID(c.Request().Context(), claims.UserID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to get user")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user")
			}

			c.Set("user", user)
			c.Set(JWT_CLAIMS, claims)
			return next(c)
		}
	}
}
