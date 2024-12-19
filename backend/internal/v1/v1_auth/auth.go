package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"

	"github.com/labstack/echo/v4"
)

/*
Simple route handler that just returns whether the email has been verified or not in JSON body.
*/
func (h *Handler) handleEmailVerificationStatus(c echo.Context) error {
	email := c.QueryParam("email")
	if email == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Missing required query parameter: 'email'", nil)
	}

	ctx := c.Request().Context()
	logger := middleware.GetLogger(c)
	pool := h.server.GetDB()

	verified, err := db.New(pool).GetUserEmailVerifiedStatusByEmail(ctx, email)
	if err != nil {
		// manually log the error for debugging purposes later
		// but the client does not need to know any specifics
		// and instead just know whether it is verified or not.
		logger.Error(err, "Something went wrong when querying user to check email verification status using email as identifier.")
	}

	return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: err == nil && verified})
}
