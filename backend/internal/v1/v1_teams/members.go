package v1_teams

import (
	"time"
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
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

	// Parse and validate request body
	var req AddTeamMemberRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request format", err)
	}
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Validation failed", err)
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

	// Return success response
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

	// Get team members from database
	queries := db.New(h.server.GetDB())
	members, err := queries.ListTeamMembers(c.Request().Context(), companyID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch team members", err)
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
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch team member", err)
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

	// Parse and validate request body
	var req UpdateTeamMemberRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request format", err)
	}
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Validation failed", err)
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
	// Get and validate IDs from path
	companyID := c.Param("company_id")
	if _, err := uuid.Parse(companyID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
	}

	memberID := c.Param("member_id")
	if _, err := uuid.Parse(memberID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid member ID format", err)
	}

	// Delete team member from database
	queries := db.New(h.server.GetDB())
	err := queries.DeleteTeamMember(c.Request().Context(), db.DeleteTeamMemberParams{
		ID:        memberID,
		CompanyID: companyID,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusNotFound, "Team member not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to delete team member", err)
	}

	return v1_common.Success(c, http.StatusOK, "Team member successfully deleted")
}
