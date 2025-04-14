package v1_projects

/*
 * package v1_projects implements the project management endpoints for the spur api.
 * this file contains core project operations including creation, retrieval,
 * updating, submission, and status management.
 */

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/service"
	"KonferCA/SPUR/internal/v1/v1_common"
	"context"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

/*
 * getUserFromContext extracts the authenticated user from the echo context.
 *
 * parameters:
 * - c: echo context containing the authenticated user
 *
 * returns:
 * - user: the authenticated user object
 * - error: if user not found or invalid type
 */
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

/*
 * handleCreateProject creates a new project for a company.
 *
 * processing:
 * - verifies user has permission to create projects
 * - gets the company associated with the user
 * - creates a new project with draft status
 *
 * response:
 * - returns the created project details
 *
 * security:
 * - requires permission: permissions.PermSubmitProject
 */
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
 * processing:
 * - authenticates the user
 * - determines user permissions and filters projects accordingly
 * - retrieves projects based on user role (admin vs regular user)
 *
 * response:
 * - returns array of projects with basic details
 *
 * security:
 * - requires authenticated user
 * - filters results based on user permissions
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
 * handleGetProject retrieves detailed information for a single project.
 *
 * input:
 * - project id (from url parameter)
 *
 * processing:
 * - verifies user has permission to access the project
 * - retrieves project details including metadata and associated entities
 * - formats data for client consumption
 *
 * response:
 * - returns comprehensive project details
 * - includes status, title, description, timestamps, and related items
 *
 * security:
 * - filters based on user permissions (admin vs company owner)
 * - ensures user can only access authorized projects
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
		AllowEdit:   project.AllowEdit,
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
				AllowEdit:   project.AllowEdit,
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
				AllowEdit:   project.AllowEdit,
				CreatedAt:   project.CreatedAt,
				UpdatedAt:   project.UpdatedAt,
			},
			CompanyName:     project.CompanyName,
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

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(ctx, user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Verify project belongs to company and check status
	project, err := h.server.GetQueries().GetProjectByID(ctx, db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Conditionally check whether the project can be submitted
	switch {
	// Case: project resubmission
	case project.Status == db.ProjectStatusNeedsreview && project.AllowEdit:
		// Get count of unresolved comments
		count, err := h.server.GetQueries().CountUnresolvedProjectComments(ctx, project.ID)
		if err != nil {
			return v1_common.NewInternalError(err)
		}
		if count > 0 {
			return v1_common.Fail(c, http.StatusBadRequest, "Resubmission of a project is only allowed once all comments have been resolved.", nil)
		}
		// Case: new project submission, status must be 'draft'
	case project.Status != db.ProjectStatusDraft:
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
	// Validate the answers
	validationErrors := validateProjectFormAnswers(questions)
	// If there are any validation errors, return them
	if len(validationErrors) > 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message":           "Project validation failed",
			"validation_errors": validationErrors,
		})
	}

	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to submit project", err)
	}
	defer tx.Rollback(ctx)

	qTx := h.server.GetQueries().WithTx(tx)

	err = service.SubmitProject(qTx, ctx, project.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to submit project", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to submit project", err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Project submitted successfully",
		"status":  "pending",
	})
}

/*
 * handleCreateAnswer creates a new answer for a project question.
 *
 * input:
 * - project id (from url parameter)
 * - question id and content in request body
 *
 * processing:
 * - verifies project ownership
 * - validates answer content against question rules
 * - creates the answer in the database
 *
 * validation:
 * - validates answer content against question rules
 * - returns validation errors if content invalid
 *
 * security:
 * - verifies project belongs to user's company
 */
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
				AllowEdit:   project.AllowEdit,
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

/*
 * handleGetLatestProjectSnapshot gets the latest project snapshot
 *
 * parameters:
 * - project_id: the project id of the snapshot
 *
 * security:
 * - for regular users, allow if user owns resource
 * - for admin, allow
 *
 * responds with db.ProjectSnapshot struct as JSON
 */
func (h *Handler) handleGetLatestProjectSnapshot(c echo.Context) error {
	projectID := c.Param("project_id")

	user, err := middleware.GetUserFromContext(c)
	if err != nil {
		return v1_common.NewAuthError("Missing user information in request.")
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	queries := h.server.GetQueries()

	// If user is not an admin, then make a check for project ownership
	if !permissions.HasPermission(uint32(user.Permissions), permissions.PermIsAdmin) {
		company, err := queries.GetCompanyByOwnerID(ctx, user.ID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return v1_common.NewNotFoundError("Company")
			}
			return v1_common.NewInternalError(err)
		}

		_, err = queries.GetProjectByID(ctx, db.GetProjectByIDParams{
			ID:        projectID,
			CompanyID: company.ID,
			Column3:   user.Permissions,
		})
		if err != nil {
			if err == pgx.ErrNoRows {
				return v1_common.NewNotFoundError("Project")
			}
			return v1_common.NewInternalError(err)
		}
	}

	snapshot, err := service.GetLatestProjectSnapshot(queries, ctx, projectID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return v1_common.NewNotFoundError("Project snapshot")
		}
		return v1_common.NewInternalError(err)
	}

	return c.JSON(http.StatusOK, snapshot)
}

/*
 * handleGetPopularProjects retrieves projects ordered by their popularity score.
 *
 * The popularity score is calculated based on:
 * - User engagement (comment activity) - highest weight (2x)
 * - Content richness (document count) - second highest weight (1.5x)
 * - Team size (team member count) - weight (1x)
 * - Recency bonus - additional points for recent activity
 *   - 10 points for projects updated within the last week
 *   - 5 points for projects updated within the last month
 *
 * parameters:
 * - limit: Maximum number of projects to return (default: 10, max: 50)
 *
 * security:
 * - Public endpoint (no authentication required)
 * - Returns only verified and pending projects
 *
 * returns:
 * - Array of PopularProjectResponse objects ordered by popularity score (highest first)
 */

func (h *Handler) handleGetPopularProjects(c echo.Context) error {
	var req GetPopularProjectsRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request parameters", err)
	}

	limit := 10
	if req.Limit > 0 {
		limit = req.Limit
	}

	projects, err := h.server.GetQueries().GetPopularProjects(c.Request().Context(), int32(limit))
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to fetch popular projects", err)
	}

	response := make([]PopularProjectResponse, 0, len(projects))
	for _, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}

		response = append(response, PopularProjectResponse{
			ProjectResponse: ProjectResponse{
				ID:          project.ID,
				Title:       project.Title,
				Description: description,
				Status:      project.Status,
				CreatedAt:   project.CreatedAt,
				UpdatedAt:   project.UpdatedAt,
			},
			PopularityScore: project.PsPopularityScore,
		})
	}

	return c.JSON(http.StatusOK, GetPopularProjectsResponse{
		Projects: response,
	})
}
