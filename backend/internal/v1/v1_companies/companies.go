package v1_companies

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
 * handleCreateCompany is the handler for creating a new company.
 * Endpoint: POST /company/new
 * Request body: CreateCompanyRequest
 * Response: CompanyResponse
 */
func (h *Handler) handleCreateCompany(c echo.Context) error {
	var req CreateCompanyRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	user, ok := c.Get("user").(*db.User)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("failed to cast user type from context"))
	}

	// Check if user has startup owner permissions
	if !permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermSubmitProject) {
		return v1_common.NewForbiddenError("only startup owners can create companies")
	}

	_, err := h.server.GetQueries().GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err == nil {
		return v1_common.NewValidationError("user already has a company")
	}

	var walletAddress *string
	if req.WalletAddress != "" {
		walletAddress = &req.WalletAddress
	}

	var website *string
	if req.Website != "" {
		website = &req.Website
	}

	var description *string
	if req.Description != "" {
		description = &req.Description
	}

	company, err := h.server.GetQueries().CreateCompany(c.Request().Context(), db.CreateCompanyParams{
		OwnerID:       user.ID,
		Name:          req.Name,
		Description:   description,
		DateFounded:   req.DateFounded,
		Stages:        req.Stages,
		Website:       website,
		WalletAddress: walletAddress,
		LinkedinUrl:   req.LinkedinURL,
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to create company")
		return v1_common.NewInternalError(err)
	}

	return c.JSON(http.StatusCreated, CompanyResponse{
		ID:            company.ID,
		OwnerID:       company.OwnerID,
		Name:          company.Name,
		Description:   company.Description,
		DateFounded:   company.DateFounded,
		Stages:        company.Stages,
		Website:       company.Website,
		WalletAddress: company.WalletAddress,
		LinkedinURL:   company.LinkedinUrl,
		CreatedAt:     company.CreatedAt,
		UpdatedAt:     company.UpdatedAt,
	})
}

/*
 * handleUpdateCompany is the handler for updating a company.
 * Endpoint: PUT /company
 * Request body: UpdateCompanyRequest
 * Response: CompanyResponse
 */
func (h *Handler) handleUpdateCompany(c echo.Context) error {
	var req UpdateCompanyRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return err
	}

	user, ok := c.Get("user").(*db.User)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("failed to cast user type from context"))
	}

	company, err := h.server.GetQueries().GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err != nil {
		log.Error().Err(err).Msg("failed to get company")
		return v1_common.NewNotFoundError("company")
	}

	// Only allow owners to update their own company
	if company.OwnerID != user.ID {
		return v1_common.NewNotFoundError("company")
	}

	var (
		walletAddress *string
		website       *string
		description   *string
		dateFounded   int64
		stages        []string
	)

	if req.WalletAddress != "" {
		walletAddress = &req.WalletAddress
	}
	if req.Website != "" {
		website = &req.Website
	}
	if req.Description != "" {
		description = &req.Description
	}
	if req.DateFounded != nil {
		dateFounded = *req.DateFounded
	} else {
		dateFounded = company.DateFounded
	}
	if len(req.Stages) > 0 {
		stages = req.Stages
	} else {
		stages = company.Stages
	}

	name := req.Name
	if name == "" {
		name = company.Name
	}
	linkedinURL := req.LinkedinURL
	if linkedinURL == "" {
		linkedinURL = company.LinkedinUrl
	}

	updatedCompany, err := h.server.GetQueries().UpdateCompany(c.Request().Context(), db.UpdateCompanyParams{
		ID:            company.ID,
		Name:          name,
		Description:   description,
		DateFounded:   dateFounded,
		Stages:        stages,
		Website:       website,
		WalletAddress: walletAddress,
		LinkedinUrl:   linkedinURL,
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to update company")
		return v1_common.NewInternalError(err)
	}

	return c.JSON(http.StatusOK, CompanyResponse{
		ID:            updatedCompany.ID,
		OwnerID:       updatedCompany.OwnerID,
		Name:          updatedCompany.Name,
		Description:   updatedCompany.Description,
		DateFounded:   updatedCompany.DateFounded,
		Stages:        updatedCompany.Stages,
		Website:       updatedCompany.Website,
		WalletAddress: updatedCompany.WalletAddress,
		LinkedinURL:   updatedCompany.LinkedinUrl,
		CreatedAt:     updatedCompany.CreatedAt,
		UpdatedAt:     updatedCompany.UpdatedAt,
	})
}

/*
 * handleGetCompany is the handler for getting a company.
 * Endpoint: GET /company/:id
 * Response: CompanyResponse
 */
func (h *Handler) handleGetCompany(c echo.Context) error {
	user, ok := c.Get("user").(*db.User)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("failed to cast user type from context"))
	}

	companyID := c.Param("id")
	if companyID != "" {
		// Check if user has admin permissions to view any company
		if !permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermAdmin) {
			return v1_common.NewForbiddenError("not authorized to access this company")
		}

		company, err := h.server.GetQueries().GetCompanyByID(c.Request().Context(), companyID)
		if err != nil {
			log.Error().Err(err).Msg("failed to get company")
			return v1_common.NewNotFoundError("company")
		}

		return c.JSON(http.StatusOK, CompanyResponse{
			ID:            company.ID,
			OwnerID:       company.OwnerID,
			Name:          company.Name,
			Description:   company.Description,
			DateFounded:   company.DateFounded,
			Stages:        company.Stages,
			Website:       company.Website,
			WalletAddress: company.WalletAddress,
			LinkedinURL:   company.LinkedinUrl,
			CreatedAt:     company.CreatedAt,
			UpdatedAt:     company.UpdatedAt,
		})
	}

	company, err := h.server.GetQueries().GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err != nil {
		log.Error().Err(err).Msg("failed to get company")
		return v1_common.NewNotFoundError("company")
	}

	return c.JSON(http.StatusOK, CompanyResponse{
		ID:            company.ID,
		OwnerID:       company.OwnerID,
		Name:          company.Name,
		Description:   company.Description,
		DateFounded:   company.DateFounded,
		Stages:        company.Stages,
		Website:       company.Website,
		WalletAddress: company.WalletAddress,
		LinkedinURL:   company.LinkedinUrl,
		CreatedAt:     company.CreatedAt,
		UpdatedAt:     company.UpdatedAt,
	})
}

func (h *Handler) handleGetCompanyByProject(c echo.Context) error {
	projectID := c.Param("id")
	if _, err := uuid.Parse(projectID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid project id", err)
	}

	company, err := h.server.GetQueries().GetCompanyByProjectID(c.Request().Context(), projectID)
	if err != nil {
		log.Error().Err(err).Msg("failed to get company")
		return v1_common.NewNotFoundError("company")
	}

	return c.JSON(http.StatusOK, CompanyResponse{
		ID:            company.ID,
		OwnerID:       company.OwnerID,
		Name:          company.Name,
		Description:   company.Description,
		DateFounded:   company.DateFounded,
		Stages:        company.Stages,
		Website:       company.Website,
		WalletAddress: company.WalletAddress,
		LinkedinURL:   company.LinkedinUrl,
		CreatedAt:     company.CreatedAt,
		UpdatedAt:     company.UpdatedAt,
	})
}
