package server

import (
	"context"
	"net/http"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateCompanyDocument(c echo.Context) error {
	var req *CreateCompanyDocumentRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateCompanyDocumentRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(req.CompanyID, "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	params := db.CreateCompanyDocumentParams{
		CompanyID:    companyID,
		DocumentType: req.DocumentType,
		FileUrl:      req.FileURL,
	}

	document, err := queries.CreateCompanyDocument(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "company document")
	}

	return c.JSON(http.StatusCreated, document)
}

func (s *Server) handleGetCompanyDocument(c echo.Context) error {
	documentID, err := validateUUID(c.Param("id"), "document")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	document, err := queries.GetCompanyDocumentByID(context.Background(), documentID)
	if err != nil {
		return handleDBError(err, "fetch", "company document")
	}

	return c.JSON(http.StatusOK, document)
}

func (s *Server) handleListCompanyDocuments(c echo.Context) error {
	companyID, err := validateUUID(c.Param("id"), "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	documentType := c.QueryParam("document_type")
	if documentType != "" {
		params := db.ListDocumentsByTypeParams{
			CompanyID:    companyID,
			DocumentType: documentType,
		}

		documents, err := queries.ListDocumentsByType(context.Background(), params)
		if err != nil {
			return handleDBError(err, "fetch", "company documents")
		}
		return c.JSON(http.StatusOK, documents)
	}

	documents, err := queries.ListCompanyDocuments(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "fetch", "company documents")
	}

	return c.JSON(http.StatusOK, documents)
}

func (s *Server) handleUpdateCompanyDocument(c echo.Context) error {
	documentID, err := validateUUID(c.Param("id"), "document")
	if err != nil {
		return err
	}

	var req *UpdateCompanyDocumentRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateCompanyDocumentRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyDocumentByID(context.Background(), documentID)
	if err != nil {
		return handleDBError(err, "verify", "company document")
	}

	params := db.UpdateCompanyDocumentParams{
		ID:           documentID,
		DocumentType: req.DocumentType,
		FileUrl:      req.FileURL,
	}

	document, err := queries.UpdateCompanyDocument(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "company document")
	}

	return c.JSON(http.StatusOK, document)
}

func (s *Server) handleDeleteCompanyDocument(c echo.Context) error {
	documentID, err := validateUUID(c.Param("id"), "document")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyDocumentByID(context.Background(), documentID)
	if err != nil {
		return handleDBError(err, "verify", "company document")
	}

	err = queries.DeleteCompanyDocument(context.Background(), documentID)
	if err != nil {
		return handleDBError(err, "delete", "company document")
	}

	return c.NoContent(http.StatusNoContent)
}
