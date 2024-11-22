package server

import (
	"context"
	"net/http"
	"strconv"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateCompanyFinancials(c echo.Context) error {
	var req *CreateCompanyFinancialsRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateCompanyFinancialsRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	params := db.CreateCompanyFinancialsParams{
		CompanyID:      companyID,
		FinancialYear:  req.FinancialYear,
		Revenue:        numericFromFloat(req.Revenue),
		Expenses:       numericFromFloat(req.Expenses),
		Profit:         numericFromFloat(req.Profit),
		Sales:          numericFromFloat(req.Sales),
		AmountRaised:   numericFromFloat(req.AmountRaised),
		Arr:            numericFromFloat(req.ARR),
		GrantsReceived: numericFromFloat(req.GrantsReceived),
	}

	financials, err := queries.CreateCompanyFinancials(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "company financials")
	}

	return c.JSON(http.StatusCreated, financials)
}

func (s *Server) handleGetCompanyFinancials(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	year := c.QueryParam("year")
	if year != "" {
		yearInt, err := strconv.Atoi(year)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid year format")
		}

		params := db.GetCompanyFinancialsByYearParams{
			CompanyID:     companyID,
			FinancialYear: int32(yearInt),
		}

		financials, err := queries.GetCompanyFinancialsByYear(context.Background(), params)
		if err != nil {
			return handleDBError(err, "fetch", "company financials")
		}

		return c.JSON(http.StatusOK, financials)
	}

	financials, err := queries.ListCompanyFinancials(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "fetch", "company financials")
	}

	return c.JSON(http.StatusOK, financials)
}

func (s *Server) handleUpdateCompanyFinancials(c echo.Context) error {
	var req *CreateCompanyFinancialsRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateCompanyFinancialsRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	year := c.QueryParam("year")
	if year == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Year parameter is required")
	}

	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid year format")
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	params := db.UpdateCompanyFinancialsParams{
		CompanyID:      companyID,
		FinancialYear:  int32(yearInt),
		Revenue:        numericFromFloat(req.Revenue),
		Expenses:       numericFromFloat(req.Expenses),
		Profit:         numericFromFloat(req.Profit),
		Sales:          numericFromFloat(req.Sales),
		AmountRaised:   numericFromFloat(req.AmountRaised),
		Arr:            numericFromFloat(req.ARR),
		GrantsReceived: numericFromFloat(req.GrantsReceived),
	}

	financials, err := queries.UpdateCompanyFinancials(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "company financials")
	}

	return c.JSON(http.StatusOK, financials)
}

func (s *Server) handleDeleteCompanyFinancials(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	year := c.QueryParam("year")
	if year == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Year parameter is required")
	}

	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid year format")
	}

	queries := db.New(s.DBPool)

	params := db.DeleteCompanyFinancialsParams{
		CompanyID:     companyID,
		FinancialYear: int32(yearInt),
	}

	err = queries.DeleteCompanyFinancials(context.Background(), params)
	if err != nil {
		return handleDBError(err, "delete", "company financials")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleGetLatestCompanyFinancials(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	financials, err := queries.GetLatestCompanyFinancials(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "fetch", "latest company financials")
	}

	return c.JSON(http.StatusOK, financials)
}
