package jwt

import (
	golangJWT "github.com/golang-jwt/jwt/v5"
)

/*
 *
 * @desc JWTClaims represents the claims that are stored in the JWT token.
 *
 * @param UserID: the user id.
 * @param TokenType: the type of token.
 * @param RegisteredClaims: the registered claims.
 *
 */
type JWTClaims struct {
	UserID    string `json:"user_id"`
	TokenType string `json:"token_type"`
	golangJWT.RegisteredClaims
}

/*
 *
 * @desc VerifyEmailJWTClaims represents the claims that are stored in the verify email JWT token.
 *
 * @param Email: the user's email.
 * @param TokenType: the type of token.
 * @param RegisteredClaims: the registered claims.
 *
 */
type VerifyEmailJWTClaims struct {
	Email     string `json:"email"`
	TokenType string `json:"token_type"`
	golangJWT.RegisteredClaims
}
