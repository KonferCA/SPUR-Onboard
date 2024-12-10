package server

import (
	"context"
	"net/http"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	mw "KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

func (s *Server) handleCreateCompany(c echo.Context) error {
	var req *CreateCompanyRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateCompanyRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ownerUUID, err := validateUUID(req.OwnerUserID, "owner")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	params := db.CreateCompanyParams{
		OwnerUserID: ownerUUID,
		Name:        req.Name,
		Description: req.Description,
	}

	company, err := queries.CreateCompany(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "company")
	}

	return c.JSON(http.StatusCreated, company)
}

func (s *Server) handleGetUserCompany(c echo.Context) error {
	claims, ok := c.Get(middleware.JWT_CLAIMS).(*jwt.JWTClaims)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to type cast jwt claims")
	}

	company, err := s.queries.GetCompanyByUser(c.Request().Context(), claims.UserID)
	if err != nil {
		if isNoRowsError(err) {
			return echo.NewHTTPError(http.StatusNotFound, "No company found")
		}
		log.Error().Err(err).Msg("Failed to get company by user")
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get company")
	}

	return c.JSON(http.StatusOK, company)
}

func (s *Server) handleGetCompany(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	company, err := queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "fetch", "company")
	}

	return c.JSON(http.StatusOK, company)
}

func (s *Server) handleListCompanies(c echo.Context) error {
	queries := db.New(s.DBPool)
	companies, err := queries.ListCompanies(context.Background())
	if err != nil {
		return handleDBError(err, "fetch", "companies")
	}

	return c.JSON(http.StatusOK, companies)
}

func (s *Server) handleDeleteCompany(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	_, err = queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	err = queries.DeleteCompany(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "delete", "company")
	}

	return c.NoContent(http.StatusNoContent)
}
