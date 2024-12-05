package jwt

import (
	"context"
	"fmt"
	"os"
	"time"

	"KonferCA/SPUR/db"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

const (
	ACCESS_TOKEN_TYPE       = "access_token"
	REFRESH_TOKEN_TYPE      = "refresh_token"
	VERIFY_EMAIL_TOKEN_TYPE = "verify_email_token"
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

/*
GenerateVerifyEmailToken generates a new token for verifying someones email.
This method uses a different jwt secret defined by JWT_SECRET_VERIFY_EMAIL
to separate authentication related jwt with this one.
*/
func GenerateVerifyEmailToken(ctx context.Context, email string, id string, exp time.Time) (string, error) {
	done := make(chan struct {
		token string
		err   error
	})

	go func() {
		claims := VerifyEmailJWTClaims{
			Email:     email,
			TokenType: VERIFY_EMAIL_TOKEN_TYPE,
			RegisteredClaims: golangJWT.RegisteredClaims{
				// expire in 1 week
				ExpiresAt: golangJWT.NewNumericDate(exp),
				IssuedAt:  golangJWT.NewNumericDate(time.Now()),
				ID:        id,
			},
		}

		token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
		signedToken, err := token.SignedString([]byte(os.Getenv("JWT_SECRET_VERIFY_EMAIL")))
		done <- struct {
			token string
			err   error
		}{signedToken, err}
	}()

	select {
	case <-ctx.Done():
		return "", fmt.Errorf("context canceled while generating verify email JWT: %w", ctx.Err())
	case result := <-done:
		return result.token, result.err
	}
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
