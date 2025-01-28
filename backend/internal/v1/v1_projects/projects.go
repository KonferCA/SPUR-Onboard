package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"database/sql"
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
	"strings"
	"time"
)

/*
 * Package v1_projects implements the project management endpoints for the SPUR API.
 * It handles project creation, retrieval, document management, and submission workflows.
 */

// Helper function to get validated user from context
func getUserFromContext(c echo.Context) (*db.GetUserByIDRow, error) {
	userVal := c.Get("user")
	if userVal == nil {
		return nil, fmt.Errorf("user not found in context")
	}

	user, ok := userVal.(*db.GetUserByIDRow)
	if !ok {
		return nil, fmt.Errorf("invalid user type in context")
	}

	return user, nil
}

func (h *Handler) handleCreateProject(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	if !permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermSubmitProject) {
		return v1_common.NewForbiddenError("not authorized to create projects")
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	var req CreateProjectRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, 400, "Invalid request", err)
	}

	// Create project
	now := time.Now().Unix()
	description := req.Description
	project, err := h.server.GetQueries().CreateProject(c.Request().Context(), db.CreateProjectParams{
		CompanyID:   company.ID,
		Title:       req.Title,
		Description: &description,
		Status:      db.ProjectStatusDraft,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to create project", err)
	}

	return c.JSON(200, ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: description,
		Status:      project.Status,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	})
}

/*
 * handleGetProjects retrieves all projects for a company.
 *
 * Security:
 * - Requires authenticated user
 * - Only returns projects for user's company
 *
 * Returns array of ProjectResponse with basic project details
 */
func (h *Handler) handleGetProjects(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get all projects for this company
	projects, err := h.server.GetQueries().GetProjectsByCompanyID(c.Request().Context(), company.ID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to fetch projects", err)
	}

	// Convert to response format
	response := make([]ProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		response[i] = ProjectResponse{
			ID:          project.ID,
			Title:       project.Title,
			Description: description,
			Status:      project.Status,
			CreatedAt:   project.CreatedAt,
			UpdatedAt:   project.UpdatedAt,
		}
	}

	return c.JSON(200, response)
}

/*
 * handleGetProject retrieves a single project by ID.
 *
 * Security:
 * - Verifies project belongs to user's company
 * - Returns 404 if project not found or unauthorized
 */
func (h *Handler) handleGetProject(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	isAdmin := permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermViewAllProjects)
	isOwner := permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermSubmitProject)
	if !isAdmin && !isOwner {
		return v1_common.NewForbiddenError("not authorized to view this project")
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

	// Get project (with company ID check for security)
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Convert to response format
	description := ""
	if project.Description != nil {
		description = *project.Description
	}

	return c.JSON(200, ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: description,
		Status:      project.Status,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	})
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
	if question.Validations != nil && *question.Validations != "" {
		if !isValidAnswer(req.Content, *question.Validations) {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"validation_errors": []ValidationError{
					{
						Question: question.Question,
						Message:  getValidationMessage(*question.Validations),
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

/*
 * handleListCompanyProjects lists all projects for a company.
 * Similar to handleGetProjects but with different response format.
 *
 * Returns:
 * - Array of projects under "projects" key
 * - Basic project details including status
 */
func (h *Handler) handleListCompanyProjects(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get all projects for this company
	projects, err := h.server.GetQueries().ListCompanyProjects(c.Request().Context(), company.ID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to fetch projects", nil)
	}

	// Convert to response format
	response := make([]ProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		response[i] = ProjectResponse{
			ID:          project.ID,
			Title:       project.Title,
			Description: description,
			Status:      project.Status,
			CreatedAt:   project.CreatedAt,
			UpdatedAt:   project.UpdatedAt,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"projects": response,
	})
}

/*
 * handleSubmitProject handles project submission for review.
 *
 * Validation:
 * 1. Verifies all required questions answered
 * 2. Validates all answers against rules
 * 3. Returns validation errors if any fail
 *
 * Flow:
 * 1. Collects all project answers
 * 2. Validates against question rules
 * 3. Updates project status to 'pending'
 * 4. Returns success with new status
 */
func (h *Handler) handleSubmitProject(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	if !permissions.HasAllPermissions(uint32(user.Permissions), permissions.PermSubmitProject) {
		return v1_common.NewForbiddenError("not authorized to submit projects")
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Verify project belongs to company and check status
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Only allow submission if project is in draft status
	if project.Status != db.ProjectStatusDraft {
		return v1_common.Fail(c, http.StatusBadRequest, "Only draft projects can be submitted", nil)
	}

	// Get all questions and answers for this project
	answers, err := h.server.GetQueries().GetProjectAnswers(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project answers", err)
	}

	// Get all questions
	questions, err := h.server.GetQueries().GetProjectQuestions(c.Request().Context())
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project questions", err)
	}

	var validationErrors []ValidationError

	// Create a map of question IDs to answers for easy lookup
	answerMap := make(map[string]string)
	for _, answer := range answers {
		answerMap[answer.QuestionID] = answer.Answer
	}

	// Validate each question
	for _, question := range questions {
		answer, exists := answerMap[question.ID]

		// Check if required question is answered
		if question.Required && (!exists || answer == "") {
			validationErrors = append(validationErrors, ValidationError{
				Question: question.Question,
				Message:  "This question requires an answer",
			})
			continue
		}

		// Skip validation if answer is empty and question is not required
		if !exists || answer == "" {
			continue
		}

		// Validate answer against rules if validations exist
		if question.Validations != nil && *question.Validations != "" {
			if !isValidAnswer(answer, *question.Validations) {
				validationErrors = append(validationErrors, ValidationError{
					Question: question.Question,
					Message:  getValidationMessage(*question.Validations),
				})
			}
		}
	}

	// If there are any validation errors, return them
	if len(validationErrors) > 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message":           "Project validation failed",
			"validation_errors": validationErrors,
		})
	}

	// Update project status to pending
	err = h.server.GetQueries().UpdateProjectStatus(c.Request().Context(), db.UpdateProjectStatusParams{
		ID:     projectID,
		Status: db.ProjectStatusPending,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update project status", err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Project submitted successfully",
		"status":  "pending",
	})
}

func (h *Handler) handleCreateAnswer(c echo.Context) error {
	var req CreateAnswerRequest

	if err := v1_common.BindandValidate(c, &req); err != nil {
		if strings.Contains(err.Error(), "required") {
			return v1_common.Fail(c, http.StatusBadRequest, "Question ID is required", err)
		}
		return v1_common.Fail(c, http.StatusNotFound, "Question not found", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Verify question exists and validate answer
	question, err := h.server.GetQueries().GetProjectQuestion(c.Request().Context(), req.QuestionID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Question not found", err)
	}

	if question.Validations != nil {
		if !isValidAnswer(req.Content, *question.Validations) {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"validation_errors": []ValidationError{
					{
						Question: question.Question,
						Message:  getValidationMessage(*question.Validations),
					},
				},
			})
		}
	}

	// Create the answer
	answer, err := h.server.GetQueries().CreateProjectAnswer(c.Request().Context(), db.CreateProjectAnswerParams{
		ProjectID:   projectID,
		QuestionID:  req.QuestionID,
		InputTypeID: question.InputTypeID,
		Answer:      req.Content,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create answer", err)
	}

	return c.JSON(http.StatusOK, answer)
}
