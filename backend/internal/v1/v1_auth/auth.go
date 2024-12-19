package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"errors"
	"net/http"

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
