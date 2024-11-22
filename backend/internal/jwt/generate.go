package jwt

import (
	"os"
	"time"

	"github.com/KonferCA/NoKap/db"
	golangJWT "github.com/golang-jwt/jwt/v5"
)

const (
	ACCESS_TOKEN_TYPE  = "access_token"
	REFRESH_TOKEN_TYPE = "refresh_token"
)

// Generates JWT tokens for the given user. Returns the access token, refresh token and error (nil if no error)
func Generate(userID string, role db.UserRole) (string, string, error) {
	accessToken, err := generateToken(userID, role, ACCESS_TOKEN_TYPE, time.Now().Add(10*time.Minute))
	if err != nil {
		return "", "", err
	}

	refreshToken, err := generateToken(userID, role, REFRESH_TOKEN_TYPE, time.Now().Add(24*7*time.Hour))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// Private helper method to generate a token.
func generateToken(userID string, role db.UserRole, tokenType string, exp time.Time) (string, error) {
	claims := JWTClaims{
		UserID:    userID,
		Role:      role,
		TokenType: tokenType,
		RegisteredClaims: golangJWT.RegisteredClaims{
			// expire in 1 week
			ExpiresAt: golangJWT.NewNumericDate(exp),
			IssuedAt:  golangJWT.NewNumericDate(time.Now()),
		},
	}

	token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
