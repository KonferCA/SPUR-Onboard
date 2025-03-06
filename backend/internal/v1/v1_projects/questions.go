package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"KonferCA/SPUR/internal/v1/v1_teams"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// helper function to format time, same as in v1_teams lol
func formatTime(t int64) string {
	return time.Unix(t, 0).Format(time.RFC3339)
}

/*
 * handleGetQuestions returns all available project questions.
 * Used by the frontend to:
 * - Show all questions that need to be answered
 * - Display which questions are required
 * - Show validation rules for each question
 *
 * Returns:
 * - Array of questions with their details
 * - Each question includes: ID, text, section, required flag, validation rules
 */
func (h *Handler) handleGetQuestions(c echo.Context) error {
	projectID := c.QueryParam("project_id")

	var (
		questions   any
		documents   []db.ProjectDocument
		teamMembers []db.TeamMember
		err         error
	)

	q := h.server.GetQueries()

	if projectID != "" {
		_, err := uuid.Parse(projectID)
		if err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Invalid project id. Must be a UUID v4.", err)
		}

		user, err := getUserFromContext(c)
		if err != nil {
			if err.Error() == "user not found in context" {
				return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized to access this endpoint.", err)
			}
			return v1_common.Fail(c, http.StatusInternalServerError, "Internal Server Error", err)
		}

		if permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermViewAllProjects) {
			questions, err = q.GetQuestionsByProjectAsAdmin(c.Request().Context(), projectID)
		} else {
			// Get all questions from database for the given project
			questions, err = q.GetQuestionsByProject(c.Request().Context(), db.GetQuestionsByProjectParams{
				ProjectID: projectID,
				OwnerID:   user.ID,
			})
		}
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
		}

		documents, err = q.GetProjectDocuments(c.Request().Context(), projectID)
		if err != nil && err.Error() != "no rows in result set" {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
		}
	} else {
		// Get all questions from database
		questions, err = q.GetProjectQuestions(c.Request().Context())
		if err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions (1)", err)
		}
	}

	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
	}

	company, err := q.GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, http.StatusBadRequest, "Missing company to get project questions", err)
		}
		return v1_common.Fail(c, http.StatusBadRequest, "Failed to get questions (2)", err)
	}

	teamMembers, err = q.ListTeamMembers(c.Request().Context(), company.ID)
	if err != nil && err.Error() != "no rows in result set" {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
	}

	// convert team members to proper response objects
	teamMemberResponses := make([]v1_teams.TeamMemberResponse, 0, len(teamMembers))
	for _, member := range teamMembers {
		// Process thhe social links with the common helper function
		socialLinks := v1_common.ProcessSocialLinks(member)
		
		// convert nullable fields to strings
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

		// create team member response
		teamMemberResponses = append(teamMemberResponses, v1_teams.TeamMemberResponse{
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
			CreatedAt:                    formatTime(member.CreatedAt),
			UpdatedAt:                    formatTime(member.UpdatedAt),
		})
	}

	// return questions array
	return c.JSON(http.StatusOK, map[string]interface{}{
		"questions":    questions,
		"documents":    documents,
		"team_members": teamMemberResponses,
	})
}
