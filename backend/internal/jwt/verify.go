package jwt

import (
	"fmt"
	"os"

	golangJWT "github.com/golang-jwt/jwt/v5"
)

/*
 *
 * @desc ParseUnverifiedClaims parses the token without verifying the signature to extract the claims.
 *		 This is used as the first step in the two-step verification process.
 *
 * @param token: the token to be parsed.
 *
 * @returns *JWTClaims, error
 *
 */
func ParseUnverifiedClaims(token string) (*JWTClaims, error) {
	parser := golangJWT.NewParser(golangJWT.WithoutClaimsValidation())
	claims := &JWTClaims{}

	_, _, err := parser.ParseUnverified(token, claims)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	return claims, nil
}

/*
 *
 * @desc VerifyTokenWithSalt verifies the given token with the given salt.
 *       If successful, then it will return the JWTClaims of the token, otherwise an error is returned.
 *
 * @param token: the token to be verified.
 * @param salt: the salt used to verify the token.
 *
 * @returns *JWTClaims, error
 *
 */
func VerifyTokenWithSalt(token string, salt []byte) (*JWTClaims, error) {
	claims := &JWTClaims{}

	_, err := golangJWT.ParseWithClaims(token, claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		// combine the salt with the secret
		secret := append([]byte(os.Getenv("JWT_SECRET")), salt...)
		return secret, nil
	})
	if err != nil {
		return nil, err
	}

	return claims, nil
}

/*
 *
 * @desc VerifyToken verifies the given token.
 *       If successful, then it will return the JWTClaims of the token, otherwise an error is returned.
 *
 * @param token: the token to be verified.
 *
 * @returns *JWTClaims, error
 *
 */
func VerifyToken(token string) (*JWTClaims, error) {
	claims := JWTClaims{}

	_, err := golangJWT.ParseWithClaims(token, &claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}

	return &claims, nil
}

/*
 *
 * @desc VerifyEmailToken verifies the given email token.
 *       If successful, then it will return the VerifyEmailJWTClaims of the token, otherwise an error is returned.
 *
 * @param token: the token to be verified.
 *
 * @returns *VerifyEmailJWTClaims, error
 *
 */
func VerifyEmailToken(token string) (*VerifyEmailJWTClaims, error) {
	claims := VerifyEmailJWTClaims{}
	_, err := golangJWT.ParseWithClaims(token, &claims, func(t *golangJWT.Token) (interface{}, error) {
		if _, ok := t.Method.(*golangJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		return []byte(os.Getenv("JWT_SECRET_VERIFY_EMAIL")), nil
	})
	if err != nil {
		return nil, err
	}

	if claims.TokenType != VERIFY_EMAIL_TOKEN_TYPE {
		return nil, fmt.Errorf("unexpected token type when verifying email token: %s", claims.TokenType)
	}

	return &claims, nil
}
