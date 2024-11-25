package jwt

import (
	"github.com/KonferCA/NoKap/db"
	golangJWT "github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID    string      `json:"user_id"`
	Role      db.UserRole `json:"role"`
	TokenType string      `json:"token_type"`
	golangJWT.RegisteredClaims
}
