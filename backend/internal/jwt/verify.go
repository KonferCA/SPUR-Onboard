package jwt

import (
	"fmt"
	"os"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

// Verifies the given token. If successful, then it will
// return the JWTClaims of the token, otherwise an error is returned.
func VerifyToken(token string) (*JWTClaims, error) {
	claims := JWTClaims{}
	_, err := golangJWT.ParseWithClaims(token, &claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}
	return &claims, nil
}

/*
VerifyEmailToken only verifies the tokens made for email verification.
*/
func VerifyEmailToken(token string) (*VerifyEmailJWTClaims, error) {
	claims := VerifyEmailJWTClaims{}
	_, err := golangJWT.ParseWithClaims(token, &claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET_VERIFY_EMAIL")), nil
	})
	if err != nil {
		return nil, err
	}
	if claims.TokenType != VERIFY_EMAIL_TOKEN_TYPE {
		return nil, fmt.Errorf("Unexpected token type when verifying email token: %s", claims.TokenType)
	}

	return &claims, nil
}
