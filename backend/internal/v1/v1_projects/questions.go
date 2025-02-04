package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

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

		// Get all questions from database for the given project
		questions, err = q.GetQuestionsByProject(c.Request().Context(), db.GetQuestionsByProjectParams{
			ProjectID: projectID,
			OwnerID:   user.ID,
		})
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

	if projectID != "" {
		// this only applies when the project questions are fetched for a specific project
		// aka a project that belongs to an existing company
		if arr, ok := questions.([]db.GetQuestionsByProjectRow); ok {
			// first question is the company name
			arr[0].Answer = company.Name
			// second question is the date founded
			arr[1].Answer = time.Unix(company.DateFounded, 0).Format("2006-01-02")
		}
	}

	teamMembers, err = q.ListTeamMembers(c.Request().Context(), company.ID)
	if err != nil && err.Error() != "no rows in result set" {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
	}

	// Return questions array
	return c.JSON(http.StatusOK, map[string]interface{}{
		"questions":    questions,
		"documents":    documents,
		"team_members": teamMembers,
	})
}
