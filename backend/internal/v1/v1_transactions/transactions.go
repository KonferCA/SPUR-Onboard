package v1_transactions

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"KonferCA/SPUR/internal/v1/v1_common"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/db"
)

func (h *Handler) handleCreateTransaction(c echo.Context) error {
	var req CreateTransactionRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	// Get user from context and verify permissions
	user := c.Get("user").(*db.GetUserByIDRow)
	if !permissions.HasAnyPermission(uint32(user.Permissions), 
		permissions.PermInvestInProjects,
		permissions.PermManageInvestments,
	) {
		return v1_common.NewForbiddenError("not authorized to create transactions")
	}

	// Get project to verify it exists and get company_id
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        req.ProjectID,
		CompanyID: "00000000-0000-0000-0000-000000000000", // Zero UUID since we want to check permissions
		Column3:   uint32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Create numeric value for amount
	var numericAmount pgtype.Numeric
	if err := numericAmount.Scan(req.ValueAmount); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid value amount", err)
	}

	// Create transaction
	tx, err := h.server.GetQueries().AddTransaction(c.Request().Context(), db.AddTransactionParams{
		ID:          uuid.New().String(),
		ProjectID:   req.ProjectID,
		CompanyID:   project.CompanyID,
		TxHash:      req.TxHash,
		FromAddress: req.FromAddress,
		ToAddress:   req.ToAddress,
		ValueAmount: numericAmount,
		CreatedBy:   user.ID, // Track who created the transaction
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create transaction", err)
	}

	// Format response
	return c.JSON(http.StatusCreated, TransactionResponse{
		ID:          tx.ID,
		ProjectID:   tx.ProjectID,
		CompanyID:   tx.CompanyID,
		TxHash:      tx.TxHash,
		FromAddress: tx.FromAddress,
		ToAddress:   tx.ToAddress,
		ValueAmount: req.ValueAmount,
		CreatedBy:   tx.CreatedBy,
	})
}
