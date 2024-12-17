package middleware

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
)

// AuthConfig holds the configuration for the Auth middleware
type AuthConfig struct {
	AcceptTokenType string
	AcceptUserRoles []db.UserRole
}

// AuthClaims represents the claims we'll store in the context
type AuthClaims struct {
	*jwt.JWTClaims
	Salt []byte
}