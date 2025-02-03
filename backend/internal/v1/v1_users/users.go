package v1_users

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"
	"time"

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

func (h *Handler) handleGetUserDetails(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	q := h.server.GetQueries()

	details, err := q.GetUserDetails(c.Request().Context(), userID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get user details", err)
	}

	// Format timestamps
	createdAt := time.Unix(details.CreatedAt, 0).Format(time.RFC3339)
	var updatedAt *string
	if details.UpdatedAt != 0 {
		formatted := time.Unix(details.UpdatedAt, 0).Format(time.RFC3339)
		updatedAt = &formatted
	}

	return c.JSON(http.StatusOK, UserDetailsResponse{
		ID:        details.ID,
		FirstName: details.FirstName,
		LastName:  details.LastName,
		Title:     details.Title,
		Bio:       details.Bio,
		LinkedIn:  details.Linkedin,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	})
}
