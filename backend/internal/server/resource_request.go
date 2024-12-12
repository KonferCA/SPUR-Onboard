package server

import (
	"net/http"

	"KonferCA/SPUR/db"
	mw "KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
)

type UpdateResourceRequestStatusRequest struct {
	Status string `json:"status" validate:"required"`
}

func (s *Server) handleCreateResourceRequest(c echo.Context) error {
	ctx := c.Request().Context()

	var req *CreateResourceRequestRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateResourceRequestRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(req.CompanyID, "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	_, err = queries.GetCompanyByID(ctx, companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	params := db.CreateResourceRequestParams{
		CompanyID:    companyID,
		ResourceType: req.ResourceType,
		Description:  req.Description,
		Status:       req.Status,
	}

	request, err := queries.CreateResourceRequest(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "resource request")
	}

	return c.JSON(http.StatusCreated, request)
}

func (s *Server) handleGetResourceRequest(c echo.Context) error {
	ctx := c.Request().Context()

	requestID, err := validateUUID(c.Param("id"), "resource request")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	request, err := queries.GetResourceRequestByID(ctx, requestID)
	if err != nil {
		return handleDBError(err, "fetch", "resource request")
	}

	return c.JSON(http.StatusOK, request)
}

func (s *Server) handleListResourceRequests(c echo.Context) error {
	ctx := c.Request().Context()

	companyID := c.QueryParam("company_id")
	queries := db.New(s.DBPool)

	if companyID != "" {
		companyUUID, err := validateUUID(companyID, "company")
		if err != nil {
			return err
		}

		_, err = queries.GetCompanyByID(ctx, companyUUID)
		if err != nil {
			return handleDBError(err, "verify", "company")
		}

		requests, err := queries.ListResourceRequestsByCompany(ctx, companyUUID)
		if err != nil {
			return handleDBError(err, "fetch", "resource requests")
		}

		return c.JSON(http.StatusOK, requests)
	}

	requests, err := queries.ListResourceRequests(ctx)
	if err != nil {
		return handleDBError(err, "fetch", "resource requests")
	}

	return c.JSON(http.StatusOK, requests)
}

func (s *Server) handleUpdateResourceRequestStatus(c echo.Context) error {
	ctx := c.Request().Context()

	requestID, err := validateUUID(c.Param("id"), "resource request")
	if err != nil {
		return err
	}

	var req *UpdateResourceRequestStatusRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateResourceRequestStatusRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	queries := db.New(s.DBPool)
	_, err = queries.GetResourceRequestByID(ctx, requestID)
	if err != nil {
		return handleDBError(err, "verify", "resource request")
	}

	request, err := queries.UpdateResourceRequestStatus(ctx, db.UpdateResourceRequestStatusParams{
		ID:     requestID,
		Status: req.Status,
	})
	if err != nil {
		return handleDBError(err, "update", "resource request status")
	}

	return c.JSON(http.StatusOK, request)
}

func (s *Server) handleDeleteResourceRequest(c echo.Context) error {
	ctx := c.Request().Context()

	requestID, err := validateUUID(c.Param("id"), "resource request")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	_, err = queries.GetResourceRequestByID(ctx, requestID)
	if err != nil {
		return handleDBError(err, "verify", "resource request")
	}

	err = queries.DeleteResourceRequest(ctx, requestID)
	if err != nil {
		handleDBError(err, "delete", "resource request")
	}

	return c.NoContent(http.StatusNoContent)
}
