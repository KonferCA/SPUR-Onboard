package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

/*
 * Package v1_projects implements the project management endpoints for the SPUR API.
 * It handles project creation, retrieval, document management, and submission workflows.
 */

// Helper function to get validated user from context
func getUserFromContext(c echo.Context) (*db.User, error) {
	userVal := c.Get("user")
	if userVal == nil {
		return nil, fmt.Errorf("user not found in context")
	}

	user, ok := userVal.(*db.User)
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

	// NOTE: this is commented out because the project title and description
	// can't be edit in the frontend so it shouldn't be a requirement to create a new project.
	// var req CreateProjectRequest
	// if err := v1_common.BindandValidate(c, &req); err != nil {
	// 	return v1_common.Fail(c, 400, "Invalid request", err)
	// }

	// get count of projects owned by the user
	count, err := h.server.GetQueries().GetProjectCountOwnedByCompany(c.Request().Context(), company.ID)

	// Create project
	now := time.Now().Unix()
	// For now the project description is just empty
	description := ""
	project, err := h.server.GetQueries().CreateProject(c.Request().Context(), db.CreateProjectParams{
		CompanyID:   company.ID,
		Title:       fmt.Sprintf("Untitled %d", count), // For now the project title is not editable in the frontend
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

	var project db.Project
	if isAdmin {
		project, err = h.server.GetQueries().GetProjectByIDAsAdmin(c.Request().Context(), projectID)
	} else {
		// Get project (with company ID check for security)
		project, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
			ID:        projectID,
			CompanyID: company.ID,
		})
	}
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
		return v1_common.Fail(c, 500, "Failed to fetch projects", err)
	}

	// Convert to response format
	response := make([]ExtendedProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		response[i] = ExtendedProjectResponse{
			ProjectResponse: ProjectResponse{
				ID:          project.ID,
				Title:       project.Title,
				Description: description,
				Status:      project.Status,
				CreatedAt:   project.CreatedAt,
				UpdatedAt:   project.UpdatedAt,
			},
			CompanyName:     company.Name,
			DocumentCount:   project.DocumentCount,
			TeamMemberCount: project.TeamMemberCount,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"projects": response,
	})
}

func (h *Handler) handleListAllProjects(c echo.Context) error {
	// Get all projects for this company
	projects, err := h.server.GetQueries().ListAllProjects(c.Request().Context())
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to fetch projects", err)
	}

	// Convert to response format
	response := make([]ExtendedProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		response[i] = ExtendedProjectResponse{
			ProjectResponse: ProjectResponse{
				ID:          project.ID,
				Title:       project.Title,
				Description: description,
				Status:      project.Status,
				CreatedAt:   project.CreatedAt,
				UpdatedAt:   project.UpdatedAt,
			},
			CompanyName:     *project.CompanyName,
			DocumentCount:   project.DocumentCount,
			TeamMemberCount: project.TeamMemberCount,
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

	// Get all questions
	questions, err := h.server.GetQueries().GetQuestionsByProject(c.Request().Context(), db.GetQuestionsByProjectParams{
		ProjectID: projectID,
		OwnerID:   user.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project questions", err)
	}

	var validationErrors []ValidationError

	// Validate each question
	for i, question := range questions {
		// First two questions are the company name and date founded which are never filled
		// by the user since they can't change through project form.
		switch i {
		case 0:
			question.Answer = company.Name
		case 1:
			question.Answer = time.Unix(company.DateFounded, 0).Format("2006-01-02")
		}
		// Check if required question is answered
		if question.Required {
			if question.ConditionType.Valid {
				// Get the dependent question's answer
				var dependentAnswer string
				var dependentChoices []string

				// Find the dependent question's answer
				for _, q := range questions {
					b := question.DependentQuestionID.Bytes
					if q.ID == fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]) {
						dependentAnswer = q.Answer
						dependentChoices = q.Choices
						break
					}
				}

				// Skip validation if condition is not met
				shouldValidate := false

				// Handle array answers (multiselect/select)
				if len(dependentChoices) > 0 {
					switch question.ConditionType.ConditionTypeEnum {
					case db.ConditionTypeEnumEmpty:
						shouldValidate = len(dependentChoices) == 0
					case db.ConditionTypeEnumNotEmpty:
						shouldValidate = len(dependentChoices) > 0
					case db.ConditionTypeEnumEquals:
						for _, choice := range dependentChoices {
							if choice == *question.ConditionValue {
								shouldValidate = true
								break
							}
						}
					case db.ConditionTypeEnumContains:
						for _, choice := range dependentChoices {
							if choice == *question.ConditionValue {
								shouldValidate = true
								break
							}
						}
					}
				} else {
					// Handle single value answers
					switch question.ConditionType.ConditionTypeEnum {
					case db.ConditionTypeEnumEmpty:
						shouldValidate = dependentAnswer == ""
					case db.ConditionTypeEnumNotEmpty:
						shouldValidate = dependentAnswer != ""
					case db.ConditionTypeEnumEquals:
						shouldValidate = dependentAnswer == *question.ConditionValue
					case db.ConditionTypeEnumContains:
						shouldValidate = strings.Contains(dependentAnswer, *question.ConditionValue)
					}
				}

				// Skip validation if condition is not met
				if !shouldValidate {
					continue
				}
			}

			switch question.InputType {
			case db.InputTypeEnumTextinput, db.InputTypeEnumTextarea:
				answer := question.Answer
				if answer == "" {
					validationErrors = append(validationErrors, ValidationError{
						Question: question.Question,
						Message:  "This question requires an answer",
					})
					continue
				}
				// Validate answer against rules if validations exist
				if question.Validations != nil {
					if !isValidAnswer(answer, question.Validations) {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  getValidationMessage(question.Validations),
						})
					}
				}
			case db.InputTypeEnumSelect, db.InputTypeEnumMultiselect:
				if len(question.Choices) < 1 {
					validationErrors = append(validationErrors, ValidationError{
						Question: question.Question,
						Message:  "This question requires an answer",
					})
					continue
				}
				if question.Validations != nil {
					for _, answer := range question.Choices {
						if !isValidAnswer(answer, question.Validations) {
							validationErrors = append(validationErrors, ValidationError{
								Question: question.Question,
								Message:  getValidationMessage(question.Validations),
							})
						}
					}
				}
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

	// Create the answer
	answer, err := h.server.GetQueries().CreateProjectAnswer(c.Request().Context(), db.CreateProjectAnswerParams{
		ProjectID:  projectID,
		QuestionID: req.QuestionID,
		Answer:     req.Content,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create answer", err)
	}

	return c.JSON(http.StatusOK, answer)
}

func (h *Handler) handleUpdateProjectStatus(c echo.Context) error {
	projectID := c.Param("id")
	if _, err := uuid.Parse(projectID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request. Invalid project id", err)
	}

	var req UpdateProjectStatusRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	queries := h.server.GetQueries()

	project, err := queries.GetProjectByIDAsAdmin(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Failed to find project to update status", err)
	}

	err = queries.UpdateProjectStatus(c.Request().Context(), db.UpdateProjectStatusParams{Status: req.Status, ID: project.ID})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update project status", err)
	}

	return v1_common.Success(c, http.StatusOK, "Project status updated")
}

/*
 * handleGetNewProjects retrieves the most recently created projects.
 *
 * parameters (all optional):
 * - count: Number of projects to return (default: 10)
 * - status: Type of projects to return (draft, pending, verified, etc.). If not provided, returns projects of any status.
 *
 * security:
 * - Public endpoint (no authentication required)
 * - Only returns basic project information
 *
 * returns array of ExtendedProjectResponse objects ordered by creation date (newest first)
 */
func (h *Handler) handleGetNewProjects(c echo.Context) error {
	var req GetNewProjectsRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request parameters", err)
	}

	// set default count if not provided
	count := 10
	if req.Count > 0 {
		count = req.Count
	}

	var projects []db.GetNewProjectsAnyStatusRow

	// if no statuses provided, default to pending and verified
	if len(req.Statuses) == 0 {
		req.Statuses = []db.ProjectStatus{db.ProjectStatusPending, db.ProjectStatusVerified}
	}

	allProjects := []db.GetNewProjectsAnyStatusRow{}

	// fetch projects for each requested status
	for _, status := range req.Statuses {
		statusProjects, err := h.server.GetQueries().GetNewProjectsByStatus(c.Request().Context(), db.GetNewProjectsByStatusParams{
			Status: status,
			Limit:  int32(count),
		})

		if err == nil {
			for _, project := range statusProjects {
				allProjects = append(allProjects, db.GetNewProjectsAnyStatusRow(project))
			}
		}
	}

	// sort by created_at in descending order (newest first)
	sort.Slice(allProjects, func(i, j int) bool {
		return allProjects[i].CreatedAt > allProjects[j].CreatedAt
	})

	// limit to requested count
	if len(allProjects) > count {
		allProjects = allProjects[:count]
	}

	projects = allProjects

	// convert to response format
	response := make([]ExtendedProjectResponse, 0, len(projects))
	for _, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		companyName := ""
		if project.CompanyName != nil {
			companyName = *project.CompanyName
		}

		response = append(response, ExtendedProjectResponse{
			ProjectResponse: ProjectResponse{
				ID:          project.ID,
				Title:       project.Title,
				Description: description,
				Status:      project.Status,
				CreatedAt:   project.CreatedAt,
				UpdatedAt:   project.UpdatedAt,
			},
			CompanyName:     companyName,
			DocumentCount:   project.DocumentCount,
			TeamMemberCount: project.TeamMemberCount,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"projects": response,
	})
}
