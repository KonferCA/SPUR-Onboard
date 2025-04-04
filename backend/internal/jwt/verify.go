package jwt

import (
	"fmt"
	"os"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

// ParseUnverifiedClaims parses the token without verifying the signature
// to extract the claims. This is used as the first step in the two-step
// verification process.
func ParseUnverifiedClaims(token string) (*JWTClaims, error) {
	// Create parser that skips claims validation
	parser := golangJWT.NewParser(golangJWT.WithoutClaimsValidation())
	claims := &JWTClaims{}
	_, _, err := parser.ParseUnverified(token, claims)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}
	return claims, nil
}

// VerifyTokenWithSalt verifies the token using the user's salt
func VerifyTokenWithSalt(token string, salt []byte) (*JWTClaims, error) {
	claims := &JWTClaims{}
	_, err := golangJWT.ParseWithClaims(token, claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		// combine base secret with user's salt
		secret := append([]byte(os.Getenv("JWT_SECRET")), salt...)
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}

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

/*
VerifyResetPasswordToken only verifies the tokens made for password reset.
*/
func VerifyResetPasswordToken(token string) (*ResetPasswordJWTClaims, error) {
	claims := ResetPasswordJWTClaims{}
	_, err := golangJWT.ParseWithClaims(token, &claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET_RESET_PASSWORD")), nil
	})
	if err != nil {
		return nil, err
	}
	if claims.TokenType != RESET_PASSWORD_TOKEN_TYPE {
		return nil, fmt.Errorf("Unexpected token type when verifying password reset token: %s", claims.TokenType)
	}

	return &claims, nil
}
