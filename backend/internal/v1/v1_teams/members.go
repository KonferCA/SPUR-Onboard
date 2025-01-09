package v1_teams

import (
	"time"
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"KonferCA/SPUR/internal/permissions"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"net/http"
)

/*
 * Formats Unix timestamp to RFC3339 string
 * Used for consistent date formatting in responses
 */
func formatTime(t int64) string {
	return time.Unix(t, 0).Format(time.RFC3339)
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

	// Create team member in database
	queries := db.New(h.server.GetDB())
	member, err := queries.CreateTeamMember(c.Request().Context(), db.CreateTeamMemberParams{
		CompanyID:      companyID,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Title:         req.Title,
		Bio:           req.Bio,
		LinkedinUrl:   req.LinkedinUrl,
		IsAccountOwner: false,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create team member", err)
	}

	// Return success response with member data
	response := TeamMemberResponse{
		ID:             member.ID,
		FirstName:      member.FirstName,
		LastName:       member.LastName,
		Title:         member.Title,
		Bio:           member.Bio,
		LinkedinUrl:   member.LinkedinUrl,
		IsAccountOwner: member.IsAccountOwner,
		CreatedAt:     formatTime(member.CreatedAt),
	}
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

	// Convert to response type
	var teamMembers []TeamMemberResponse
	for _, member := range members {
		teamMembers = append(teamMembers, TeamMemberResponse{
			ID:             member.ID,
			FirstName:      member.FirstName,
			LastName:       member.LastName,
			Title:         member.Title,
			Bio:           member.Bio,
			LinkedinUrl:   member.LinkedinUrl,
			IsAccountOwner: member.IsAccountOwner,
			CreatedAt:     formatTime(member.CreatedAt),
		})
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

	response := TeamMemberResponse{
		ID:             member.ID,
			FirstName:      member.FirstName,
			LastName:       member.LastName,
			Title:         member.Title,
			Bio:           member.Bio,
			LinkedinUrl:   member.LinkedinUrl,
			IsAccountOwner: member.IsAccountOwner,
			CreatedAt:     formatTime(member.CreatedAt),
					UpdatedAt:     formatTime(member.UpdatedAt),
	}
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

	// Update team member in database
	queries := db.New(h.server.GetDB())
	member, err := queries.UpdateTeamMember(c.Request().Context(), db.UpdateTeamMemberParams{
		ID:          memberID,
		CompanyID:   companyID,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Title:       req.Title,
		Bio:         req.Bio,
		LinkedinUrl: req.LinkedinUrl,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update team member", err)
	}

	response := TeamMemberResponse{
		ID:             member.ID,
			FirstName:      member.FirstName,
			LastName:       member.LastName,
			Title:         member.Title,
			Bio:           member.Bio,
			LinkedinUrl:   member.LinkedinUrl,
			IsAccountOwner: member.IsAccountOwner,
			CreatedAt:     formatTime(member.CreatedAt),
			UpdatedAt:     formatTime(member.UpdatedAt),
	}
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

	queries := db.New(h.server.GetDB())

	// First check if member exists
	_, err := queries.GetTeamMember(c.Request().Context(), db.GetTeamMemberParams{
		ID: memberID,
		CompanyID: companyID,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to retrieve team member", err)
	}

	// Delete team member
	err = queries.DeleteTeamMember(c.Request().Context(), db.DeleteTeamMemberParams{
		ID:        memberID,
		CompanyID: companyID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to delete team member", err)
	}

	return v1_common.Success(c, http.StatusOK, "Team member successfully deleted")
}

/*
 * Validates if the current user has access to the specified company
 * Access rules:
 * - Company owners have full access regardless of requireOwner value
 * - When requireOwner is true, only company owners are allowed
 * - When requireOwner is false:
 *   - Company owners are allowed
 *   - Users with ViewAllProjects permission are allowed read-only access
 *   - Other users are denied access
 *
 * Parameters:
 *   - c: Echo context containing the authenticated user
 *   - companyID: ID of the company to check access for
 *   - requireOwner: If true, only allows company owners. If false, allows owners and users with ViewAllProjects permission.
 *
 * Returns:
 *   - nil if access is granted
 *   - error if access is denied or validation fails
 */
func (h *Handler) validateCompanyAccess(c echo.Context, companyID string, requireOwner bool) error {
	user := c.Get("user").(*db.GetUserByIDRow)
	if user == nil {
		return v1_common.NewAuthError("User not found in context")
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
		return nil
	}

	// For non-owners, check if they have view permissions and owner access isn't required
	if !requireOwner && permissions.HasAllPermissions(user.Permissions, permissions.PermViewAllProjects) {
		return nil // Allow users with view permissions
	}

	return v1_common.NewAuthError("Not authorized to access this company")
}
