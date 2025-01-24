package v1_projects

import (
	"KonferCA/SPUR/internal/v1/v1_common"
	"net/http"

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
	// Get all questions from database
	questions, err := h.server.GetQueries().GetProjectQuestions(c.Request().Context())
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get questions", err)
	}

	// Return questions array
	return c.JSON(http.StatusOK, map[string]interface{}{
		"questions": questions,
	})
}
