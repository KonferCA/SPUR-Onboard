package v1_teams

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

/*
 * Formats Unix timestamp to RFC3339 string
 * Used for consistent date formatting in responses
 */

// helper function to convert db.TeamMember to TeamMemberResponse
func buildTeamMemberResponse(member db.TeamMember) TeamMemberResponse {
	// process social links
	socialLinks := v1_common.ProcessSocialLinks(member)

	// safely handle optional fields
	previousWorkStr := ""
	if member.PreviousWork != nil {
		previousWorkStr = *member.PreviousWork
	}
	resumeExternalUrlStr := ""
	if member.ResumeExternalUrl != nil {
		resumeExternalUrlStr = *member.ResumeExternalUrl
	}
	resumeInternalUrlStr := ""
	if member.ResumeInternalUrl != nil {
		resumeInternalUrlStr = *member.ResumeInternalUrl
	}
	foundersAgreementExternalUrlStr := ""
	if member.FoundersAgreementExternalUrl != nil {
		foundersAgreementExternalUrlStr = *member.FoundersAgreementExternalUrl
	}
	foundersAgreementInternalUrlStr := ""
	if member.FoundersAgreementInternalUrl != nil {
		foundersAgreementInternalUrlStr = *member.FoundersAgreementInternalUrl
	}

	// build response object
	return TeamMemberResponse{
		ID:                           member.ID,
		CompanyID:                    member.CompanyID,
		FirstName:                    member.FirstName,
		LastName:                     member.LastName,
		Title:                        member.Title,
		SocialLinks:                  socialLinks,
		IsAccountOwner:               member.IsAccountOwner,
		CommitmentType:               member.CommitmentType,
		Introduction:                 member.Introduction,
		IndustryExperience:           member.IndustryExperience,
		DetailedBiography:            member.DetailedBiography,
		PreviousWork:                 previousWorkStr,
		ResumeExternalUrl:            resumeExternalUrlStr,
		ResumeInternalUrl:            resumeInternalUrlStr,
		FoundersAgreementExternalUrl: foundersAgreementExternalUrlStr,
		FoundersAgreementInternalUrl: foundersAgreementInternalUrlStr,
		CreatedAt:                    v1_common.FormatUnixTime(member.CreatedAt),
		UpdatedAt:                    v1_common.FormatUnixTime(member.UpdatedAt),
	}
}

/*
 * Creates a new team member for a company
 * Endpoint: POST /companies/:company_id/team
 * Request body: AddTeamMemberRequest
 * Response: TeamMemberResponse
 */
func (h *Handler) handleAddTeamMember(c echo.Context) error {
	// Get company ID from path
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	// Company access validation
	if err := h.validateCompanyAccess(c, companyID, true); err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Not authorized to access this company", err)
	}

	// Parse and validate request body
	var req AddTeamMemberRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Process social links from the socialLinks array
	socialLinksJSON, err := v1_common.ProcessSocialLinksRequest(req.SocialLinks)
	if err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid social links format", err)
	}

	// Create team member in database
	queries := db.New(h.server.GetDB())
	member, err := queries.CreateTeamMember(c.Request().Context(), db.CreateTeamMemberParams{
		CompanyID:                    companyID,
		FirstName:                    req.FirstName,
		LastName:                     req.LastName,
		Title:                        req.Title,
		LinkedinUrl:                  req.LinkedinUrl,
		SocialLinks:                  socialLinksJSON,
		IsAccountOwner:               false,
		PersonalWebsite:              req.PersonalWebsite,
		CommitmentType:               req.CommitmentType,
		Introduction:                 req.Introduction,
		IndustryExperience:           req.IndustryExperience,
		DetailedBiography:            req.DetailedBiography,
		PreviousWork:                 req.PreviousWork,
		ResumeExternalUrl:            req.ResumeExternalUrl,
		ResumeInternalUrl:            req.ResumeInternalUrl,
		FoundersAgreementExternalUrl: req.FoundersAgreementExternalUrl,
		FoundersAgreementInternalUrl: req.FoundersAgreementInternalUrl,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create team member", err)
	}

	// Use helper function to build response
	response := buildTeamMemberResponse(member)
	return c.JSON(http.StatusCreated, response)
}

/*
 * Retrieves all team members for a company
 * Endpoint: GET /companies/:company_id/team
 * Response: TeamMembersResponse containing array of TeamMemberResponse
 */
func (h *Handler) handleGetTeamMembers(c echo.Context) error {
	// Get company ID from path
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	// Company access validation - allow non-owners to view
	if err := h.validateCompanyAccess(c, companyID, false); err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Not authorized to access this company", err)
	}

	// Get team members from database
	queries := db.New(h.server.GetDB())
	members, err := queries.ListTeamMembers(c.Request().Context(), companyID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to retrieve team members", err)
	}

	// Convert to response type using helper function
	var teamMembers []TeamMemberResponse
	for _, member := range members {
		teamMembers = append(teamMembers, buildTeamMemberResponse(member))
	}

	return c.JSON(http.StatusOK, TeamMembersResponse{TeamMembers: teamMembers})
}

/*
 * Retrieves a specific team member by ID
 * Endpoint: GET /companies/:company_id/team/:member_id
 * Response: TeamMemberResponse
 */
func (h *Handler) handleGetTeamMember(c echo.Context) error {
	// Get and validate IDs from path
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	memberID := c.Param("member_id")
	if _, err := uuid.Parse(memberID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid member ID format", err)
	}

	// Company access validation - allow non-owners to view
	if err := h.validateCompanyAccess(c, companyID, false); err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Not authorized to access this company", err)
	}

	// Get team member from database
	queries := db.New(h.server.GetDB())
	member, err := queries.GetTeamMember(c.Request().Context(), db.GetTeamMemberParams{
		ID:        memberID,
		CompanyID: companyID,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to retrieve team member", err)
	}

	// Use helper function to build response
	response := buildTeamMemberResponse(member)
	return c.JSON(http.StatusOK, response)
}

/*
 * Updates an existing team member's information
 * Endpoint: PUT /companies/:company_id/team/:member_id
 * Request body: UpdateTeamMemberRequest
 * Response: TeamMemberResponse
 */
func (h *Handler) handleUpdateTeamMember(c echo.Context) error {
	// Get and validate IDs from path
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	memberID := c.Param("member_id")
	if _, err := uuid.Parse(memberID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid member ID format", err)
	}

	// Validate company access (only owners can update)
	if err := h.validateCompanyAccess(c, companyID, true); err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Not authorized to access this company", err)
	}

	// Parse and validate request body
	var req UpdateTeamMemberRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Process social links from the socialLinks array
	socialLinksJSON, err := v1_common.ProcessSocialLinksRequest(req.SocialLinks)
	if err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid social links format", err)
	}

	// Update team member in database
	queries := db.New(h.server.GetDB())

	// Convert pointer strings to regular strings for the update params
	personalWebsiteStr := ""
	if req.PersonalWebsite != nil {
		personalWebsiteStr = *req.PersonalWebsite
	}

	previousWorkStr := ""
	if req.PreviousWork != nil {
		previousWorkStr = *req.PreviousWork
	}

	resumeExternalUrlStr := ""
	if req.ResumeExternalUrl != nil {
		resumeExternalUrlStr = *req.ResumeExternalUrl
	}

	resumeInternalUrlStr := ""
	if req.ResumeInternalUrl != nil {
		resumeInternalUrlStr = *req.ResumeInternalUrl
	}

	foundersAgreementExternalUrlStr := ""
	if req.FoundersAgreementExternalUrl != nil {
		foundersAgreementExternalUrlStr = *req.FoundersAgreementExternalUrl
	}

	foundersAgreementInternalUrlStr := ""
	if req.FoundersAgreementInternalUrl != nil {
		foundersAgreementInternalUrlStr = *req.FoundersAgreementInternalUrl
	}

	member, err := queries.UpdateTeamMember(c.Request().Context(), db.UpdateTeamMemberParams{
		ID:                           memberID,
		CompanyID:                    companyID,
		FirstName:                    req.FirstName,
		LastName:                     req.LastName,
		Title:                        req.Title,
		DetailedBiography:            req.DetailedBiography,
		LinkedinUrl:                  req.LinkedinUrl,
		SocialLinks:                  socialLinksJSON,
		PersonalWebsite:              personalWebsiteStr,
		CommitmentType:               req.CommitmentType,
		Introduction:                 req.Introduction,
		IndustryExperience:           req.IndustryExperience,
		PreviousWork:                 previousWorkStr,
		ResumeExternalUrl:            resumeExternalUrlStr,
		ResumeInternalUrl:            resumeInternalUrlStr,
		FoundersAgreementExternalUrl: foundersAgreementExternalUrlStr,
		FoundersAgreementInternalUrl: foundersAgreementInternalUrlStr,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update team member", err)
	}

	// Use helper function to build response
	response := buildTeamMemberResponse(member)
	return c.JSON(http.StatusOK, response)
}

/*
 * Deletes a team member from a company
 * Endpoint: DELETE /companies/:company_id/team/:member_id
 * Response: Success message
 */
func (h *Handler) handleDeleteTeamMember(c echo.Context) error {
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	memberID := c.Param("member_id")
	if _, err := uuid.Parse(memberID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid member ID format", err)
	}

	// Validate company access (only owners can delete)
	if err := h.validateCompanyAccess(c, companyID, true); err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Not authorized to access this company", err)
	}

	// Check and delete in one transaction to reduce database calls
	ctx := c.Request().Context()
	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to start transaction", err)
	}

	// Create queries with transaction
	qtx := db.New(tx)

	// Check if member exists
	_, err = qtx.GetTeamMember(ctx, db.GetTeamMemberParams{
		ID:        memberID,
		CompanyID: companyID,
	})
	if err != nil {
		tx.Rollback(ctx)
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to retrieve team member", err)
	}

	// Delete team member
	err = qtx.DeleteTeamMember(ctx, db.DeleteTeamMemberParams{
		ID:        memberID,
		CompanyID: companyID,
	})
	if err != nil {
		tx.Rollback(ctx)
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to delete team member", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to commit transaction", err)
	}

	return v1_common.Success(c, http.StatusOK, "Team member successfully deleted")
}

/*
 * Company access validation with caching per request to reduce db calls.
 * Uses echo context values to cache company authorization results.
 *
 * Access rules:
 * - Company owners have full access regardless of requireOwner value
 * - When requireOwner is true, only company owners are allowed
 * - When requireOwner is false:
 *   - Company owners are allowed
 *   - Users with ViewAllProjects permission are allowed read-only access
 *   - Other users are denied access
 */
func (h *Handler) validateCompanyAccess(c echo.Context, companyID string, requireOwner bool) error {
	user := c.Get("user").(*db.User)
	if user == nil {
		return v1_common.NewAuthError("User not found in context")
	}

	// Check if we have a cached access result for this company
	cacheKey := "company_access:" + companyID
	if val, ok := c.Get(cacheKey).(bool); ok {
		// If we require owner, we need an explicit owner check
		if requireOwner {
			ownerCacheKey := "company_owner:" + companyID
			if val, ok := c.Get(ownerCacheKey).(bool); ok {
				if val {
					return nil // User is owner, allow access
				}
				return v1_common.NewAuthError("Not authorized to access this company")
			}
		} else if val {
			return nil // We have cached access permission
		}
	}

	queries := db.New(h.server.GetDB())

	// First check if user is the company owner
	company, err := queries.GetCompany(c.Request().Context(), companyID)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.NewNotFoundError("Company not found")
		}
		return v1_common.NewInternalError(err)
	}

	// If user is the owner, they have full access
	if company.OwnerID == user.ID {
		// Cache both owner status and general access
		c.Set("company_owner:"+companyID, true)
		c.Set("company_access:"+companyID, true)
		return nil
	}

	// Cache non-owner status
	c.Set("company_owner:"+companyID, false)

	// For non-owners, check if they have view permissions and owner access isn't required
	if !requireOwner && permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermViewAllProjects) {
		c.Set("company_access:"+companyID, true)
		return nil // Allow users with view permissions
	}

	c.Set("company_access:"+companyID, false)
	return v1_common.NewAuthError("Not authorized to access this company")
}
