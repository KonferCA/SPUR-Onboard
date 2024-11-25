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
