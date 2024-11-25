package server

import (
	"context"
	"net/http"

	"github.com/KonferCA/NoKap/db"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateStartup(c echo.Context) error {
	var req CreateCompanyRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body :(")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := uuid.Validate(req.OwnerUserID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid owner ID format")
	}

	queries := db.New(s.DBPool)
	params := db.CreateCompanyParams{
		OwnerUserID: req.OwnerUserID,
		Name:        req.Name,
		Description: req.Description,
	}

	company, err := queries.CreateCompany(context.Background(), params)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create company :(")
	}

	return c.JSON(http.StatusCreated, company)
}

func (s *Server) handleGetStartup(c echo.Context) error {
	queries := db.New(s.DBPool)

	companies, err := queries.ListCompanies(context.Background())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch companies :(")
	}

	return c.JSON(http.StatusOK, companies)
}
