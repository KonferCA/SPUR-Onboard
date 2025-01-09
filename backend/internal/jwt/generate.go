package jwt

import (
	"os"
	"time"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

const (
	ACCESS_TOKEN_TYPE       = "access_token"
	REFRESH_TOKEN_TYPE      = "refresh_token"
	VERIFY_EMAIL_TOKEN_TYPE = "verify_email_token"
)

// Generates JWT tokens for the given user. Returns the access token, refresh token and error (nil if no error)
func GenerateWithSalt(userID string, permissions uint32, salt []byte) (string, string, error) {
	accessToken, err := generateTokenWithSalt(userID, permissions, ACCESS_TOKEN_TYPE, time.Now().Add(10*time.Minute), salt)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := generateTokenWithSalt(userID, permissions, REFRESH_TOKEN_TYPE, time.Now().Add(24*7*time.Hour), salt)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

/*
GenerateVerifyEmailToken generates a new token for verifying someones email.
This method uses a different jwt secret defined by JWT_SECRET_VERIFY_EMAIL
to separate authentication related jwt with this one.
*/
func GenerateVerifyEmailToken(email string, id string, exp time.Time) (string, error) {
	claims := VerifyEmailJWTClaims{
		Email:     email,
		TokenType: VERIFY_EMAIL_TOKEN_TYPE,
		RegisteredClaims: golangJWT.RegisteredClaims{
			ExpiresAt: golangJWT.NewNumericDate(exp),
			IssuedAt:  golangJWT.NewNumericDate(time.Now()),
			ID:        id,
		},
	}

	token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET_VERIFY_EMAIL")))
}

// Private helper method to generate a token with user's salt
func generateTokenWithSalt(userID string, permissions uint32, tokenType string, exp time.Time, salt []byte) (string, error) {
	claims := JWTClaims{
		UserID:      userID,
		Permissions: permissions,
		TokenType:   tokenType,
		RegisteredClaims: golangJWT.RegisteredClaims{
			ExpiresAt: golangJWT.NewNumericDate(exp),
			IssuedAt:  golangJWT.NewNumericDate(time.Now()),
		},
	}

	token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
	// combine base secret with user's salt
	secret := append([]byte(os.Getenv("JWT_SECRET")), salt...)
	return token.SignedString(secret)
}
