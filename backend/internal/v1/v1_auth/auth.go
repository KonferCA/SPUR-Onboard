package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/v1/v1_common"
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// verify password hash using bcrypt
func verifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

/*
Simple route handler that just returns whether the email has been verified or not in JSON body.
*/
func (h *Handler) handleEmailVerificationStatus(c echo.Context) error {
	user, ok := c.Get("user").(*db.GetUserByIDRow)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("Failed to cast user type from context that should have been set by Auth middleware."))
	}

	return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: user.EmailVerified})
}

/*
 * Handles user login flow:
 * 1. Validates email/password
 * 2. Generates access/refresh tokens
 * 3. Sets HTTP-only cookie with refresh token
 * 4. Returns access token and user info
 */
func (h *Handler) handleLogin(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request format", err)
	}

	// validate request
	if err := c.Validate(req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Validation failed", err)
	}

	queries := db.New(h.server.GetDB())
	user, err := queries.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	if !verifyPassword(req.Password, user.Password) {
		return v1_common.Fail(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, user.TokenSalt)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to generate tokens", err)
	}

	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = refreshToken
	cookie.Expires = time.Now().Add(24 * 7 * time.Hour)
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.SameSite = http.SameSiteStrictMode
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, LoginResponse{
		AccessToken: accessToken,
		User: UserResponse{
			Email:         user.Email,
			EmailVerified: user.EmailVerified,
			Role:         user.Role,
		},
	})
}
