package jwt

import (
	"os"
	"time"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

/*
 *
 * The different types of tokens that can be generated.
 *
 * ACCESS_TOKEN_TYPE is used for authenticating the user.
 * REFRESH_TOKEN_TYPE is used to refresh the access token.
 * VERIFY_EMAIL_TOKEN_TYPE is used to verify the user's email.
 *
 */
const (
	ACCESS_TOKEN_TYPE       = "access_token"
	REFRESH_TOKEN_TYPE      = "refresh_token"
	VERIFY_EMAIL_TOKEN_TYPE = "verify_email_token"
)

/*
 *
 * @desc GenerateWithSalt generates a new access and refresh token for the given user id.
 *       The salt is used to generate the token.
 *       The access token expires in 10 minutes and the refresh token expires in 7 days.
 *
 * @param userID: the user id.
 * @param salt: the salt used to generate the token.
 *
 * @returns accessToken, refreshToken, error
 *
 */
func GenerateWithSalt(userID string, salt []byte) (string, string, error) {
	accessToken, err := generateTokenWithSalt(userID, ACCESS_TOKEN_TYPE, time.Now().Add(10*time.Minute), salt)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := generateTokenWithSalt(userID, REFRESH_TOKEN_TYPE, time.Now().Add(24*7*time.Hour), salt)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

/*
 *
 * @desc GenerateAccessToken generates a new access token for the given user id.
 *       The access token expires in 10 minutes.
 *
 * @param email: the user's email.
 * @param id: the user's id.
 * @param exp: the expiration time of the token.
 *
 * @returns accessToken, error
 *
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

	// generate a new token with the claims
	token := golangJWT.NewWithClaims(golangJWT.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET_VERIFY_EMAIL")))
}

/*
 *
 * @desc generateTokenWithSalt generates a new token for the given user id, token type, and expiration time.
 *       The salt is used to generate the token.
 *
 * @param userID: the user id.
 * @param tokenType: the type of token.
 * @param exp: the expiration time of the token.
 * @param salt: the salt used to generate the token.
 *
 * @returns token, error
 *
 */
func generateTokenWithSalt(userID string, tokenType string, exp time.Time, salt []byte) (string, error) {
	claims := JWTClaims{
		UserID:    userID,
		TokenType: tokenType,
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
