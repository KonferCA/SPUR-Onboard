package server

import (
	"context"
	"fmt"
	"net/http"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateFundingTransaction(c echo.Context) error {
	var req *CreateFundingTransactionRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateFundingTransactionRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	projectID, err := validateUUID(req.ProjectID, "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetProject(context.Background(), projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	amount, err := validateNumeric(req.Amount)
	if err != nil {
		return err
	}

	params := db.CreateFundingTransactionParams{
		ProjectID:         projectID,
		Amount:            amount,
		Currency:          req.Currency,
		TransactionHash:   req.TransactionHash,
		FromWalletAddress: req.FromWalletAddress,
		ToWalletAddress:   req.ToWalletAddress,
		Status:            req.Status,
	}

	transaction, err := queries.CreateFundingTransaction(context.Background(), params)
	if err != nil {
		fmt.Printf("Error creating transaction: %v\n", err)
		return handleDBError(err, "create", "funding transaction")
	}

	return c.JSON(http.StatusCreated, transaction)
}

func (s *Server) handleGetFundingTransaction(c echo.Context) error {
	transactionID, err := validateUUID(c.Param("id"), "transaction")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	transaction, err := queries.GetFundingTransaction(context.Background(), transactionID)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return echo.NewHTTPError(http.StatusNotFound, "funding transaction not found :(")
		}

		return handleDBError(err, "fetch", "funding transaction")
	}

	return c.JSON(http.StatusOK, transaction)
}

func (s *Server) handleListFundingTransactions(c echo.Context) error {
	queries := db.New(s.DBPool)
	projectID := c.QueryParam("project_id")

	if projectID != "" {
		projectUUID, err := validateUUID(projectID, "project")
		if err != nil {
			return err
		}

		transactions, err := queries.ListProjectFundingTransactions(context.Background(), projectUUID)
		if err != nil {
			return handleDBError(err, "fetch", "funding transactions")
		}

		return c.JSON(http.StatusOK, transactions)
	}

	transactions, err := queries.ListFundingTransactions(context.Background())
	if err != nil {
		return handleDBError(err, "fetch", "funding transactions")
	}

	return c.JSON(http.StatusOK, transactions)
}

func (s *Server) handleUpdateFundingTransactionStatus(c echo.Context) error {
	transactionID, err := validateUUID(c.Param("id"), "transaction")
	if err != nil {
		return err
	}

	var req *UpdateFundingTransactionStatusRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateFundingTransactionStatusRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetFundingTransaction(context.Background(), transactionID)
	if err != nil {
		return handleDBError(err, "verify", "funding transaction")
	}

	params := db.UpdateFundingTransactionStatusParams{
		ID:     transactionID,
		Status: req.Status,
	}

	transaction, err := queries.UpdateFundingTransactionStatus(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "funding transaction")
	}

	return c.JSON(http.StatusOK, transaction)
}

func (s *Server) handleDeleteFundingTransaction(c echo.Context) error {
	transactionID, err := validateUUID(c.Param("id"), "transaction")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetFundingTransaction(context.Background(), transactionID)
	if err != nil {
		return handleDBError(err, "verify", "funding transaction")
	}

	err = queries.DeleteFundingTransaction(context.Background(), transactionID)
	if err != nil {
		return handleDBError(err, "delete", "funding transaction")
	}

	return c.NoContent(http.StatusNoContent)
}
