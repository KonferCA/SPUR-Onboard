package middleware

import (
	"net/http"
	"strings"

	"github.com/KonferCA/NoKap/internal/jwt"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

const JWT_CLAIMS = "MIDDLEWARE_JWT_CLAIMS"

// Middleware that validate the "Authorization" header for a Bearer token.
// Matches the received token with the accepted token type.
func ProtectAPI(acceptTokenType string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authorization := c.Request().Header.Get(echo.HeaderAuthorization)
			parts := strings.Split(authorization, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authorization header. Only accept Bearer token.")
			}
			claims, err := jwt.VerifyToken(parts[1])
			if err != nil {
				log.Error().Err(err).Msg("JWT verification error")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token.")
			}
			// match token type
			if acceptTokenType != claims.TokenType {
				log.Error().Str("accept", acceptTokenType).Str("received", claims.TokenType).Msg("Invalid token type.")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token.")
			}
			c.Set(JWT_CLAIMS, claims)
			return next(c)
		}
	}
}
