package tests

import (
	"os"
	"testing"
	"time"

	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/permissions"

	"github.com/stretchr/testify/assert"
)

func TestJWT(t *testing.T) {
	// setup env
	os.Setenv("JWT_SECRET", "secret")
	os.Setenv("JWT_SECRET_VERIFY_EMAIL", "test-secret")

	userID := "some-user-id"
	perms := uint32(permissions.PermSubmitProject | permissions.PermManageTeam)
	salt := []byte("test-salt")

	t.Run("token salt invalidation", func(t *testing.T) {
		// Generate initial salt
		initialSalt := []byte("initial-salt")

		// Generate tokens with initial salt
		accessToken, refreshToken, err := jwt.GenerateWithSalt(userID, perms, initialSalt)
		assert.Nil(t, err)
		assert.NotEmpty(t, accessToken)
		assert.NotEmpty(t, refreshToken)

		// Verify tokens work with initial salt
		claims, err := jwt.VerifyTokenWithSalt(accessToken, initialSalt)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
		assert.Equal(t, claims.Permissions, perms)
		assert.Equal(t, claims.TokenType, jwt.ACCESS_TOKEN_TYPE)

		// Change salt (simulating token invalidation)
		newSalt := []byte("new-salt")

		// Old tokens should fail verification with new salt
		_, err = jwt.VerifyTokenWithSalt(accessToken, newSalt)
		assert.NotNil(t, err, "Token should be invalid with new salt")

		// Generate new tokens with new salt
		newAccessToken, newRefreshToken, err := jwt.GenerateWithSalt(userID, perms, newSalt)
		assert.Nil(t, err)
		assert.NotEmpty(t, newAccessToken)
		assert.NotEmpty(t, newRefreshToken)

		// New tokens should work with new salt
		claims, err = jwt.VerifyTokenWithSalt(newAccessToken, newSalt)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
	})

	t.Run("two-step verification", func(t *testing.T) {
		salt := []byte("test-salt")

		// Generate a token
		accessToken, _, err := jwt.GenerateWithSalt(userID, perms, salt)
		assert.Nil(t, err)

		// Step 1: Parse claims without verification
		unverifiedClaims, err := jwt.ParseUnverifiedClaims(accessToken)
		assert.Nil(t, err)
		assert.Equal(t, userID, unverifiedClaims.UserID)

		// Step 2: Verify with salt
		verifiedClaims, err := jwt.VerifyTokenWithSalt(accessToken, salt)
		assert.Nil(t, err)
		assert.Equal(t, userID, verifiedClaims.UserID)

		// Try to verify with wrong salt
		wrongSalt := []byte("wrong-salt")
		_, err = jwt.VerifyTokenWithSalt(accessToken, wrongSalt)
		assert.NotNil(t, err, "Token should be invalid with wrong salt")
	})

	t.Run("generate access token", func(t *testing.T) {
		accessToken, _, err := jwt.GenerateWithSalt(userID, perms, salt)
		assert.Nil(t, err)
		assert.NotEmpty(t, accessToken)
		claims, err := jwt.VerifyTokenWithSalt(accessToken, salt)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
		assert.Equal(t, claims.Permissions, perms)
		assert.Equal(t, claims.TokenType, jwt.ACCESS_TOKEN_TYPE)
	})

	t.Run("generate refresh token", func(t *testing.T) {
		_, refreshToken, err := jwt.GenerateWithSalt(userID, perms, salt)
		assert.Nil(t, err)
		assert.NotEmpty(t, refreshToken)
		claims, err := jwt.VerifyTokenWithSalt(refreshToken, salt)
		assert.Nil(t, err)
		assert.Equal(t, claims.UserID, userID)
		assert.Equal(t, claims.Permissions, perms)
		assert.Equal(t, claims.TokenType, jwt.REFRESH_TOKEN_TYPE)
	})

	t.Run("verify email token", func(t *testing.T) {
		email := "test@mail.com"
		id := "some-id"
		exp := time.Now().Add(time.Second * 5)
		token, err := jwt.GenerateVerifyEmailToken(email, id, exp)
		assert.Nil(t, err)
		claims, err := jwt.VerifyEmailToken(token)
		assert.Nil(t, err)
		assert.Equal(t, claims.Email, email)
		assert.Equal(t, claims.ID, id)
		assert.Equal(t, claims.ExpiresAt.Unix(), exp.Unix())
	})

	t.Run("deny expired verify email token", func(t *testing.T) {
		email := "test@mail.com"
		id := "some-id"
		exp := time.Now().Add(-1 * 5 * time.Second)
		token, err := jwt.GenerateVerifyEmailToken(email, id, exp)
		assert.Nil(t, err)
		_, err = jwt.VerifyEmailToken(token)
		assert.NotNil(t, err)
	})
}
