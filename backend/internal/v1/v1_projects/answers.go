package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
)

/*
 * handleSaveProjectDraft updates a batch of answers for a project.
 * These answers must be of type string or array of string
 *
 * Security:
 * - Verifies project belongs to user's company
 */
func (h *Handler) handleSaveProjectDraft(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	var req SaveProjectDraftRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	q := h.server.GetQueries()

	var params []db.UpdateProjectDraftParams
	for _, item := range req.Draft {
		question, err := q.GetProjectQuestion(c.Request().Context(), item.QuestionID)
		if err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Invalid question ID", err)
		}

		var answer string
		var choices []string

		switch question.InputType {
		case db.InputTypeEnumSelect, db.InputTypeEnumMultiselect:
			switch v := item.Answer.(type) {
			case string:
				answer = v
			case []interface{}:
				for _, choice := range v {
					if str, ok := choice.(string); ok {
						choices = append(choices, str)
					}
				}
			}
		default:
		}

		params = append(params, db.UpdateProjectDraftParams{
			ProjectID:  projectID,
			QuestionID: item.QuestionID,
			Answer:     answer,
			Choices:    choices,
		})
	}
	batch := q.UpdateProjectDraft(c.Request().Context(), params)
	defer batch.Close()
	batch.Exec(func(i int, err error) {
		if err != nil {
			v1_common.Fail(c, http.StatusInternalServerError, "Failed to save draft", err)
		}
	})

	if !c.Response().Committed {
		return v1_common.Success(c, http.StatusOK, "Draft saved")
	}
	return nil
}

/*
 * handlePatchProjectAnswer updates an answer for a project question.
 *
 * Validation:
 * - Validates answer content against question rules
 * - Returns validation errors if content invalid
 *
 * Security:
 * - Verifies project belongs to user's company
 */
func (h *Handler) handlePatchProjectAnswer(c echo.Context) error {
	// Validate static parameters first
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Parse and validate request body
	var req PatchAnswerRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, 400, "Invalid request body", err)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get the question for this answer to check validations
	question, err := h.server.GetQueries().GetQuestionByAnswerID(c.Request().Context(), req.AnswerID)
	if err != nil {
		return v1_common.Fail(c, 404, "Question not found", err)
	}

	// Validate the answer content
	if question.Validations != nil {
		if !isValidAnswer(req.Content, question.Validations) {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"validation_errors": []ValidationError{
					{
						Question: question.Question,
						Message:  getValidationMessage(question.Validations),
					},
				},
			})
		}
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get project and verify status
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Only allow updates if project is in draft status
	if project.Status != db.ProjectStatusDraft {
		return v1_common.Fail(c, 400, "Project answers can only be updated while in draft status", nil)
	}

	// Update the answer
	_, err = h.server.GetQueries().UpdateProjectAnswer(c.Request().Context(), db.UpdateProjectAnswerParams{
		Answer:    req.Content,
		ID:        req.AnswerID,
		ProjectID: projectID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, 404, "Answer not found", err)
		}
		return v1_common.Fail(c, 500, "Failed to update answer", err)
	}

	return c.JSON(200, map[string]string{
		"message": "Answer updated successfully",
	})
}

/*
 * handleGetProjectAnswers retrieves all answers for a project.
 *
 * Returns:
 * - Question ID and content
 * - Current answer text
 * - Question section
 *
 * Security:
 * - Verifies project belongs to user's company
 */
func (h *Handler) handleGetProjectAnswers(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get project answers
	answers, err := h.server.GetQueries().GetProjectAnswers(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to get project answers", err)
	}

	// Verify project belongs to company
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Convert to response format
	response := make([]ProjectAnswerResponse, len(answers))
	for i, a := range answers {
		response[i] = ProjectAnswerResponse{
			ID:         a.AnswerID,
			QuestionID: a.QuestionID,
			Question:   a.Question,
			Answer:     a.Answer,
			Section:    a.Section,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"answers": response,
	})
}
