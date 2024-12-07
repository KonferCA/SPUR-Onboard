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

// Middleware that validate the "Authorization" header for a Bearer token.
// Matches the received token with the accepted token type.
func ProtectAPI(acceptTokenType string, queries *db.Queries) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authorization := c.Request().Header.Get(echo.HeaderAuthorization)
			parts := strings.Split(authorization, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authorization header. Only accept Bearer token.")
			}

			// Step 1: Parse claims without verification to get userID
			unverifiedClaims, err := jwt.ParseUnverifiedClaims(parts[1])
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
			claims, err := jwt.VerifyTokenWithSalt(parts[1], salt)
			if err != nil {
				log.Error().Err(err).Msg("JWT verification error")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
			}

			// Step 4: Verify token type
			if acceptTokenType != claims.TokenType {
				log.Error().Str("accept", acceptTokenType).Str("received", claims.TokenType).Msg("Invalid token type")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token type")
			}

			c.Set(JWT_CLAIMS, claims)
			return next(c)
		}
	}
}
