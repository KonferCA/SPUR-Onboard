package jwt

import (
	"os"
	"testing"
	"time"

	"github.com/KonferCA/NoKap/db"
	golangJWT "github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestJWT(t *testing.T) {
	// setup env
	os.Setenv("JWT_SECRET", "secret")

	userID := "some-user-id"
	role := db.UserRole("user")
	exp := time.Now().Add(5 * time.Minute)

	t.Run("generate access token", func(t *testing.T) {
		token, err := generateToken(userID, role, ACCESS_TOKEN_TYPE, exp)
		assert.Nil(t, err)
		assert.NotEmpty(t, token)
		claims, err := VerifyToken(token)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
		assert.Equal(t, claims.Role, role)
		assert.Equal(t, claims.TokenType, ACCESS_TOKEN_TYPE)
		assert.Equal(t, claims.RegisteredClaims.ExpiresAt, golangJWT.NewNumericDate(exp))
	})

	t.Run("generate refresh token", func(t *testing.T) {
		token, err := generateToken(userID, role, REFRESH_TOKEN_TYPE, exp)
		assert.Nil(t, err)
		assert.NotEmpty(t, token)
		claims, err := VerifyToken(token)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
		assert.Equal(t, claims.Role, role)
		assert.Equal(t, claims.TokenType, REFRESH_TOKEN_TYPE)
		assert.Equal(t, claims.RegisteredClaims.ExpiresAt, golangJWT.NewNumericDate(exp))
	})

	t.Run("generate both refresh and access token", func(t *testing.T) {
		a, r, err := Generate(userID, role)
		assert.Nil(t, err)
		assert.NotEmpty(t, a)
		assert.NotEmpty(t, r)
		claims, err := VerifyToken(a)
		assert.Nil(t, err)
		assert.Equal(t, claims.TokenType, ACCESS_TOKEN_TYPE)
		claims, err = VerifyToken(r)
		assert.Equal(t, claims.TokenType, REFRESH_TOKEN_TYPE)
	})

	t.Run("deny token with wrong signature", func(t *testing.T) {
		a, r, err := Generate(userID, role)
		assert.Nil(t, err)
		// change secret
		os.Setenv("JWT_SECRET", "changed")
		_, err = VerifyToken(a)
		assert.NotNil(t, err)
		// restore error to nil
		err = nil
		// test the other token
		_, err = VerifyToken(r)
		assert.NotNil(t, err)
		// restore secret
		os.Setenv("JWT_SECRET", "secret")
	})

	t.Run("deny expired token", func(t *testing.T) {
		exp = time.Now().Add(-1 * 5 * time.Minute)
		token, err := generateToken(userID, role, ACCESS_TOKEN_TYPE, exp)
		assert.Nil(t, err)
		_, err = VerifyToken(token)
		assert.NotNil(t, err)
	})
}
