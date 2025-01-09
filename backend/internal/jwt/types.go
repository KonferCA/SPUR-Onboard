package jwt

import (
	golangJWT "github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID      string `json:"user_id"`
	Permissions uint32 `json:"permissions"`
	TokenType   string `json:"token_type"`
	golangJWT.RegisteredClaims
}

type VerifyEmailJWTClaims struct {
	Email     string `json:"email"`
	TokenType string `json:"token_type"`
	golangJWT.RegisteredClaims
}
