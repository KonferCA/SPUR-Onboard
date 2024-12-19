package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/v1/v1_common"
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
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
		return v1_common.Fail(c, http.StatusBadRequest, "Failed to verify email. Invalid token.", err)
	}

	if time.Now().After(claims.ExpiresAt.Time) {
		return v1_common.Fail(c, http.StatusBadRequest, "Failed to verify email. Link expired.", nil)
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
