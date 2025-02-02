package v1_users

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *Handler) handleUpdateUserDetails(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	var req UpdateUserDetailsRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	q := h.server.GetQueries()

	err := q.UpdateUserDetails(c.Request().Context(), db.UpdateUserDetailsParams{
		FirstName: &req.FirstName,
		LastName:  &req.LastName,
		Title:     &req.Title,
		Bio:       &req.Bio,
		Linkedin:  &req.LinkedIn,
		ID:        userID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Oops something went wrong (2)", err)
	}

	return v1_common.Success(c, http.StatusOK, "User details saved")
}
