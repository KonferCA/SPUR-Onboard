package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/v1/v1_common"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

const (
	// Name of the cookie that holds the refresh token.
	COOKIE_REFRESH_TOKEN string = "refresh_token"
)

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
Route handles incoming requests to register/create a new account.
- Allow if the email is valid
- Allow if no other user has the same email already
- Responds with the access token and basic user information upon success
- HTTP-only cookie is also set with the refresh token value
*/
func (h *Handler) handleRegister(c echo.Context) error {
	reqBodyBytes, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}
	var reqBody RegisterRequest
	err = json.Unmarshal(reqBodyBytes, &reqBody)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	q := h.server.GetQueries()

	exists, err := q.UserExistsByEmail(ctx, reqBody.Email)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	if exists {
		return v1_common.Fail(c, http.StatusBadRequest, "Email has already been occupied.", nil)
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(reqBody.Password), bcrypt.DefaultCost)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	newUser, err := q.NewUser(ctx, db.NewUserParams{
		Email:    reqBody.Email,
		Password: string(passwordHash),
		Role:     db.UserRoleStartupOwner,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	// generate new access and refresh tokens
	accessToken, refreshToken, err := jwt.GenerateWithSalt(newUser.ID, newUser.Role, newUser.TokenSalt)
	if err != nil {
		return v1_common.Success(c, http.StatusOK, "Registration complete but failed to sign in. Please sign in manually.")
	}

	// set the refresh token cookie
	setRefreshTokenCookie(c, refreshToken)

	return c.JSON(http.StatusCreated, map[string]any{
		"access_token": accessToken,
		"user": map[string]any{
			"email":          newUser.Email,
			"email_verified": newUser.EmailVerified,
			"role":           newUser.Role,
		},
	})
}

/*
This route is responsible in handling incoming requests to verify a user's email.
The link must have an email token as query parameter. The email token is a normal JWT as 'token'.
This email token is verified against our database.
*/
func (h *Handler) handleVerifyEmail(c echo.Context) error {
	logger := middleware.GetLogger(c)
	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	tokenStr := c.QueryParam("token")
	if tokenStr == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Missing required query parameter: 'token'", nil)
	}

	claims, err := jwt.VerifyEmailToken(tokenStr)
	if err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Failed to verify email. Invalid or expired token.", err)
	}

	token, err := db.New(h.server.GetDB()).GetVerifyEmailTokenByID(ctx, claims.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email.", err)
	}

	// start transaction to make sure that both user email verified status and the email token are deleted
	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email.", err)
	}
	q := db.New(h.server.GetDB()).WithTx(tx)
	err = q.UpdateUserEmailVerifiedStatus(ctx, db.UpdateUserEmailVerifiedStatusParams{EmailVerified: true, ID: token.UserID})
	if err != nil {
		if err := tx.Rollback(ctx); err != nil {
			logger.Error(err, "Failed to rollback")
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email.", err)
	}

	err = q.RemoveVerifyEmailTokenByID(ctx, token.ID)
	if err != nil {
		if err := tx.Rollback(ctx); err != nil {
			logger.Error(err, "Failed to rollback")
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email.", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		if err := tx.Rollback(ctx); err != nil {
			logger.Error(err, "Failed to rollback")
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email.", err)
	}

	return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: true})
}
