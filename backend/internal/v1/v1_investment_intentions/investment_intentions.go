package v1_investment_intentions

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (h *Handler) handleCreateInvestmentIntention(c echo.Context) error {
	var req CreateInvestmentIntentionRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	// get user from context
	user := c.Get("user").(*db.User)

	// verify project exists
	_, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        req.ProjectID,
		CompanyID: "00000000-0000-0000-0000-000000000000", // zero uuid since we want to check permissions
		Column3:   uint32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// check if investment intention already exists for this user and project
	_, err = h.server.GetQueries().GetInvestmentIntentionsByProjectAndInvestor(c.Request().Context(), db.GetInvestmentIntentionsByProjectAndInvestorParams{
		ProjectID:  req.ProjectID,
		InvestorID: user.ID,
	})
	if err == nil {
		// intention already exists, return error
		return v1_common.Fail(c, http.StatusBadRequest, "Investment intention already exists for this project", nil)
	}

	// create numeric value for amount
	var numericAmount pgtype.Numeric
	if err := numericAmount.Scan(req.IntendedAmount); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid intended amount", err)
	}

	// create investment intention
	intention, err := h.server.GetQueries().CreateInvestmentIntention(c.Request().Context(), db.CreateInvestmentIntentionParams{
		ID:             uuid.New().String(),
		ProjectID:      req.ProjectID,
		InvestorID:     user.ID,
		IntendedAmount: numericAmount,
		Status:         db.InvestmentStatusCommitted,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create investment intention", err)
	}

	// format response
	return c.JSON(http.StatusCreated, InvestmentIntentionResponse{
		ID:             intention.ID,
		ProjectID:      intention.ProjectID,
		InvestorID:     intention.InvestorID,
		IntendedAmount: req.IntendedAmount,
		Status:         intention.Status,
		CreatedAt:      intention.CreatedAt,
		UpdatedAt:      intention.UpdatedAt,
	})
}

func (h *Handler) handleListInvestmentIntentions(c echo.Context) error {
	var req ListInvestmentIntentionsRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.NewValidationError("Invalid request parameters")
	}

	// get user from context
	user := c.Get("user").(*db.User)
	userPerms := uint32(user.Permissions)

	var intentions []InvestmentIntentionResponse

	// determine what intentions to return based on permissions and query params
	if req.ProjectID != "" {
		// list intentions for a specific project
		if !permissions.HasPermission(userPerms, permissions.PermViewAllProjects) &&
			!permissions.HasPermission(userPerms, permissions.PermManageInvestments) {
			return v1_common.NewForbiddenError("Not authorized to view project investment intentions")
		}

		results, err := h.server.GetQueries().GetInvestmentIntentionsByProject(c.Request().Context(), req.ProjectID)
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch investment intentions", err)
		}

		intentions = convertProjectInvestmentIntentions(results)
	} else if req.InvestorID != "" {
		// list intentions for a specific investor
		if req.InvestorID != user.ID && !permissions.HasPermission(userPerms, permissions.PermManageInvestments) {
			return v1_common.NewForbiddenError("Not authorized to view other investor's intentions")
		}

		results, err := h.server.GetQueries().GetInvestmentIntentionsByInvestor(c.Request().Context(), req.InvestorID)
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch investment intentions", err)
		}

		intentions = convertInvestorInvestmentIntentions(results)
	} else if req.Status != "" {
		// list intentions by status - admin only
		if !permissions.HasPermission(userPerms, permissions.PermManageInvestments) {
			return v1_common.NewForbiddenError("Not authorized to filter by status")
		}

		status := db.InvestmentStatus(req.Status)
		results, err := h.server.GetQueries().GetInvestmentIntentionsByStatus(c.Request().Context(), status)
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch investment intentions", err)
		}

		intentions = convertFullInvestmentIntentions(results)
	} else {
		// default: list investor's own intentions
		results, err := h.server.GetQueries().GetInvestmentIntentionsByInvestor(c.Request().Context(), user.ID)
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch investment intentions", err)
		}

		intentions = convertInvestorInvestmentIntentions(results)
	}

	return c.JSON(http.StatusOK, InvestmentIntentionsListResponse{
		InvestmentIntentions: intentions,
		Total:                len(intentions),
	})
}

func (h *Handler) handleGetInvestmentIntention(c echo.Context) error {
	intentionID := c.Param("id")
	if intentionID == "" {
		return v1_common.NewValidationError("Investment intention ID is required")
	}

	// get user from context
	user := c.Get("user").(*db.User)
	userPerms := uint32(user.Permissions)

	intention, err := h.server.GetQueries().GetInvestmentIntentionByID(c.Request().Context(), intentionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Investment intention not found", err)
	}

	// check permissions - user can see their own, admin can see all
	if intention.InvestorID != user.ID && !permissions.HasPermission(userPerms, permissions.PermManageInvestments) {
		return v1_common.NewForbiddenError("Not authorized to view this investment intention")
	}

	return c.JSON(http.StatusOK, convertFullInvestmentIntention(intention))
}

func (h *Handler) handleUpdateInvestmentIntention(c echo.Context) error {
	intentionID := c.Param("id")
	if intentionID == "" {
		return v1_common.NewValidationError("Investment intention ID is required")
	}

	var req UpdateInvestmentIntentionRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	// get user from context
	user := c.Get("user").(*db.User)

	// get existing intention to verify ownership
	existingIntention, err := h.server.GetQueries().GetInvestmentIntentionByID(c.Request().Context(), intentionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Investment intention not found", err)
	}

	// verify user owns this intention
	if existingIntention.InvestorID != user.ID {
		return v1_common.NewForbiddenError("Not authorized to update this investment intention")
	}

	// update amount if provided
	if req.IntendedAmount != "" {
		var numericAmount pgtype.Numeric
		if err := numericAmount.Scan(req.IntendedAmount); err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Invalid intended amount", err)
		}

		updatedIntention, err := h.server.GetQueries().UpdateInvestmentIntentionAmount(c.Request().Context(), db.UpdateInvestmentIntentionAmountParams{
			ID:             intentionID,
			IntendedAmount: numericAmount,
		})
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update investment intention", err)
		}

		return c.JSON(http.StatusOK, InvestmentIntentionResponse{
			ID:             updatedIntention.ID,
			ProjectID:      updatedIntention.ProjectID,
			InvestorID:     updatedIntention.InvestorID,
			IntendedAmount: req.IntendedAmount,
			Status:         updatedIntention.Status,
			CreatedAt:      updatedIntention.CreatedAt,
			UpdatedAt:      updatedIntention.UpdatedAt,
		})
	}

	// no updates provided
	return v1_common.NewValidationError("No valid fields provided for update")
}

func (h *Handler) handleUpdateInvestmentIntentionStatus(c echo.Context) error {
	intentionID := c.Param("id")
	if intentionID == "" {
		return v1_common.NewValidationError("Investment intention ID is required")
	}

	var req UpdateInvestmentIntentionStatusRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	// verify intention exists
	_, err := h.server.GetQueries().GetInvestmentIntentionByID(c.Request().Context(), intentionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Investment intention not found", err)
	}

	// update status
	status := db.InvestmentStatus(req.Status)
	updatedIntention, err := h.server.GetQueries().UpdateInvestmentIntentionStatus(c.Request().Context(), db.UpdateInvestmentIntentionStatusParams{
		ID:              intentionID,
		Status:          status,
		TransactionHash: req.TransactionHash,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update investment intention status", err)
	}

	// format amount for response
	amountStr := "0"
	if updatedIntention.IntendedAmount.Valid {
		amountStr = updatedIntention.IntendedAmount.Int.String()
	}

	return c.JSON(http.StatusOK, InvestmentIntentionResponse{
		ID:              updatedIntention.ID,
		ProjectID:       updatedIntention.ProjectID,
		InvestorID:      updatedIntention.InvestorID,
		IntendedAmount:  amountStr,
		Status:          updatedIntention.Status,
		TransactionHash: updatedIntention.TransactionHash,
		CreatedAt:       updatedIntention.CreatedAt,
		UpdatedAt:       updatedIntention.UpdatedAt,
	})
}

func (h *Handler) handleDeleteInvestmentIntention(c echo.Context) error {
	intentionID := c.Param("id")
	if intentionID == "" {
		return v1_common.NewValidationError("Investment intention ID is required")
	}

	// get user from context
	user := c.Get("user").(*db.User)
	userPerms := uint32(user.Permissions)

	// get existing intention to verify ownership (unless admin)
	existingIntention, err := h.server.GetQueries().GetInvestmentIntentionByID(c.Request().Context(), intentionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Investment intention not found", err)
	}

	// verify user owns this intention or is admin
	if existingIntention.InvestorID != user.ID && !permissions.HasPermission(userPerms, permissions.PermManageInvestments) {
		return v1_common.NewForbiddenError("Not authorized to delete this investment intention")
	}

	// delete intention
	err = h.server.GetQueries().DeleteInvestmentIntention(c.Request().Context(), intentionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to delete investment intention", err)
	}

	return v1_common.Success(c, http.StatusOK, "Investment intention deleted successfully")
}

func (h *Handler) handleGetProjectInvestmentSummary(c echo.Context) error {
	projectID := c.Param("project_id")
	if projectID == "" {
		return v1_common.NewValidationError("Project ID is required")
	}

	// get user from context to verify project access
	user := c.Get("user").(*db.User)

	// verify project exists and user has access
	_, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: "00000000-0000-0000-0000-000000000000", // zero uuid since we want to check permissions
		Column3:   uint32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	summary, err := h.server.GetQueries().GetTotalInvestmentIntentionsForProject(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get investment summary", err)
	}

	// format amount for response
	amountStr := "0"
	if numericAmount, ok := summary.TotalAmount.(pgtype.Numeric); ok && numericAmount.Valid {
		amountStr = numericAmount.Int.String()
	}

	return c.JSON(http.StatusOK, ProjectInvestmentSummaryResponse{
		TotalAmount: amountStr,
		TotalCount:  summary.TotalCount,
	})
}

func (h *Handler) handleBulkUpdateInvestmentIntentionStatus(c echo.Context) error {
	projectID := c.Param("project_id")
	if projectID == "" {
		return v1_common.NewValidationError("Project ID is required")
	}

	var req struct {
		FromStatus string `json:"from_status" validate:"required,oneof=committed waiting_for_transfer transferred_to_spur transferred_to_company"`
		ToStatus   string `json:"to_status" validate:"required,oneof=committed waiting_for_transfer transferred_to_spur transferred_to_company"`
	}

	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	// verify project exists
	user := c.Get("user").(*db.User)
	_, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: "00000000-0000-0000-0000-000000000000",
		Column3:   uint32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// bulk update status
	err = h.server.GetQueries().BulkUpdateInvestmentIntentionStatus(c.Request().Context(), db.BulkUpdateInvestmentIntentionStatusParams{
		ProjectID: projectID,
		Status:    db.InvestmentStatus(req.ToStatus),
		Status_2:  db.InvestmentStatus(req.FromStatus),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to bulk update investment intention status", err)
	}

	return v1_common.Success(c, http.StatusOK, "Investment intention statuses updated successfully")
}

// helper functions for converting database results to response types

func convertProjectInvestmentIntentions(results []db.GetInvestmentIntentionsByProjectRow) []InvestmentIntentionResponse {
	intentions := make([]InvestmentIntentionResponse, len(results))
	for i, result := range results {
		amountStr := "0"
		if result.IntendedAmount.Valid && result.IntendedAmount.Int != nil {
			amountStr = result.IntendedAmount.Int.String()
		}

		intentions[i] = InvestmentIntentionResponse{
			ID:                result.ID,
			ProjectID:         result.ProjectID,
			InvestorID:        result.InvestorID,
			IntendedAmount:    amountStr,
			Status:            result.Status,
			TransactionHash:   result.TransactionHash,
			CreatedAt:         result.CreatedAt,
			UpdatedAt:         result.UpdatedAt,
			InvestorFirstName: result.InvestorFirstName,
			InvestorLastName:  result.InvestorLastName,
			InvestorEmail:     &result.InvestorEmail,
		}
	}
	return intentions
}

func convertInvestorInvestmentIntentions(results []db.GetInvestmentIntentionsByInvestorRow) []InvestmentIntentionResponse {
	intentions := make([]InvestmentIntentionResponse, len(results))
	for i, result := range results {
		amountStr := "0"
		if result.IntendedAmount.Valid && result.IntendedAmount.Int != nil {
			amountStr = result.IntendedAmount.Int.String()
		}

		intentions[i] = InvestmentIntentionResponse{
			ID:              result.ID,
			ProjectID:       result.ProjectID,
			InvestorID:      result.InvestorID,
			IntendedAmount:  amountStr,
			Status:          result.Status,
			TransactionHash: result.TransactionHash,
			CreatedAt:       result.CreatedAt,
			UpdatedAt:       result.UpdatedAt,
			ProjectTitle:    &result.ProjectTitle,
			CompanyName:     &result.CompanyName,
		}
	}
	return intentions
}

func convertFullInvestmentIntentions(results []db.GetInvestmentIntentionsByStatusRow) []InvestmentIntentionResponse {
	intentions := make([]InvestmentIntentionResponse, len(results))
	for i, result := range results {
		amountStr := "0"
		if result.IntendedAmount.Valid && result.IntendedAmount.Int != nil {
			amountStr = result.IntendedAmount.Int.String()
		}

		intentions[i] = InvestmentIntentionResponse{
			ID:                result.ID,
			ProjectID:         result.ProjectID,
			InvestorID:        result.InvestorID,
			IntendedAmount:    amountStr,
			Status:            result.Status,
			TransactionHash:   result.TransactionHash,
			CreatedAt:         result.CreatedAt,
			UpdatedAt:         result.UpdatedAt,
			InvestorFirstName: result.InvestorFirstName,
			InvestorLastName:  result.InvestorLastName,
			InvestorEmail:     &result.InvestorEmail,
			ProjectTitle:      &result.ProjectTitle,
			CompanyName:       &result.CompanyName,
		}
	}
	return intentions
}

func convertFullInvestmentIntention(result db.GetInvestmentIntentionByIDRow) InvestmentIntentionResponse {
	amountStr := "0"
	if result.IntendedAmount.Valid && result.IntendedAmount.Int != nil {
		amountStr = result.IntendedAmount.Int.String()
	}

	return InvestmentIntentionResponse{
		ID:                result.ID,
		ProjectID:         result.ProjectID,
		InvestorID:        result.InvestorID,
		IntendedAmount:    amountStr,
		Status:            result.Status,
		TransactionHash:   result.TransactionHash,
		CreatedAt:         result.CreatedAt,
		UpdatedAt:         result.UpdatedAt,
		InvestorFirstName: result.InvestorFirstName,
		InvestorLastName:  result.InvestorLastName,
		InvestorEmail:     &result.InvestorEmail,
		ProjectTitle:      &result.ProjectTitle,
		CompanyName:       &result.CompanyName,
	}
}
