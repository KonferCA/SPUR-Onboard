package v1_transactions

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"KonferCA/SPUR/internal/v1/v1_common"
	"KonferCA/SPUR/db"
)

func (h *Handler) handleCreateTransaction(c echo.Context) error {
	var req CreateTransactionRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Validation failed", err)
	}

	// Validate project ID format
	if _, err := uuid.Parse(req.ProjectID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid project ID format", err)
	}

	// Get project to verify it exists and get company_id
	project, err := h.server.GetQueries().GetProjectByIDAdmin(c.Request().Context(), req.ProjectID)
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
	})
}
