package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
)

/*
 * handleGetProjectComments retrieves all comments for a project.
 *
 * Security:
 * - Verifies project belongs to user's company
 * - Returns 404 if project not found
 */
func (h *Handler) handleGetProjectComments(c echo.Context) error {
	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	// Verify project exists using admin query
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
		Column3:   int32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	comments, err := h.server.GetQueries().GetProjectComments(c.Request().Context(), project.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project comments", err)
	}

	// Convert to response format
	response := make([]CommentResponse, len(comments))
	for i, comment := range comments {
		response[i] = CommentResponse{
			ID:                 comment.ID,
			ProjectID:          comment.ProjectID,
			TargetID:           comment.TargetID,
			Comment:            comment.Comment,
			CommenterID:        comment.CommenterID,
			CreatedAt:          comment.CreatedAt,
			UpdatedAt:          comment.UpdatedAt,
			CommenterFirstName: comment.CommenterFirstName,
			CommenterLastName:  comment.CommenterLastName,
		}
	}

	return c.JSON(http.StatusOK, CommentsResponse{Comments: response})
}

/*
 * handleGetProjectComment retrieves a single comment by ID.
 *
 * Security:
 * - Verifies project belongs to user's company
 * - Returns 404 if comment not found
 */
func (h *Handler) handleGetProjectComment(c echo.Context) error {
	// Get project and comment IDs from URL
	projectID := c.Param("id")
	commentID := c.Param("comment_id")
	if projectID == "" || commentID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID and Comment ID are required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	// Verify project exists using admin query
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
		Column3:   int32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Get specific comment
	comment, err := h.server.GetQueries().GetProjectComment(c.Request().Context(), db.GetProjectCommentParams{
		ID:        commentID,
		ProjectID: project.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Comment not found", err)
	}

	response := CommentResponse{
		ID:                 comment.ID,
		ProjectID:          comment.ProjectID,
		TargetID:           comment.TargetID,
		Comment:            comment.Comment,
		CommenterID:        comment.CommenterID,
		CreatedAt:          comment.CreatedAt,
		UpdatedAt:          comment.UpdatedAt,
		CommenterFirstName: comment.CommenterFirstName,
		CommenterLastName:  comment.CommenterLastName,
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) handleCreateProjectComment(c echo.Context) error {
	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	// Verify project exists using admin query
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
		Column3:   int32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Parse request body
	var req CreateCommentRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request data", err)
	}

	// Create comment
	comment, err := h.server.GetQueries().CreateProjectComment(c.Request().Context(), db.CreateProjectCommentParams{
		ProjectID:   project.ID,
		TargetID:    req.TargetID,
		Comment:     req.Comment,
		CommenterID: user.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create comment", err)
	}

	response := CommentResponse{
		ID:          comment.ID,
		ProjectID:   comment.ProjectID,
		TargetID:    comment.TargetID,
		Comment:     comment.Comment,
		CommenterID: comment.CommenterID,
		CreatedAt:   comment.CreatedAt,
		UpdatedAt:   comment.UpdatedAt,
	}

	return c.JSON(http.StatusCreated, response)
}

func (h *Handler) handleUpdateProjectComment(c echo.Context) error {
	// Get IDs from URL
	projectID := c.Param("id")
	commentID := c.Param("comment_id")
	if projectID == "" || commentID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID and Comment ID are required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	// Verify project exists using admin query
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
		Column3:   int32(user.Permissions),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	var req UpdateCommentRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request", err)
	}

	// Update the comment
	_, err = h.server.GetQueries().UpdateProjectComment(c.Request().Context(), db.UpdateProjectCommentParams{
		ID:      commentID,
		Comment: req.Comment,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update comment", err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Comment updated successfully",
	})
}

func (h *Handler) handleResolveComment(c echo.Context) error {
	// Get IDs from URL
	projectID := c.Param("id")
	commentID := c.Param("comment_id")
	if projectID == "" || commentID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID and Comment ID are required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Check if user has admin permission
	if uint32(user.Permissions)&permissions.PermIsAdmin == 0 {
		return v1_common.Fail(c, http.StatusForbidden, "Only admins can resolve comments", nil)
	}

	// Resolve the comment
	comment, err := h.server.GetQueries().ResolveProjectComment(c.Request().Context(), db.ResolveProjectCommentParams{
		ID:        commentID,
		ProjectID: projectID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, http.StatusNotFound, "Comment not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to resolve comment", err)
	}

	return c.JSON(http.StatusOK, CommentResponse{
		ID:          comment.ID,
		ProjectID:   comment.ProjectID,
		TargetID:    comment.TargetID,
		Comment:     comment.Comment,
		CommenterID: comment.CommenterID,
		Resolved:    comment.Resolved,
		CreatedAt:   comment.CreatedAt,
		UpdatedAt:   comment.UpdatedAt,
	})
}

func (h *Handler) handleUnresolveComment(c echo.Context) error {
	// Get IDs from URL
	projectID := c.Param("id")
	commentID := c.Param("comment_id")
	if projectID == "" || commentID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID and Comment ID are required", nil)
	}

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Check if user has admin permission
	if uint32(user.Permissions)&permissions.PermIsAdmin == 0 {
		return v1_common.Fail(c, http.StatusForbidden, "Only admins can unresolve comments", nil)
	}

	// Unresolve the comment
	comment, err := h.server.GetQueries().UnresolveProjectComment(c.Request().Context(), db.UnresolveProjectCommentParams{
		ID:        commentID,
		ProjectID: projectID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, http.StatusNotFound, "Comment not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to unresolve comment", err)
	}

	return c.JSON(http.StatusOK, CommentResponse{
		ID:          comment.ID,
		ProjectID:   comment.ProjectID,
		TargetID:    comment.TargetID,
		Comment:     comment.Comment,
		CommenterID: comment.CommenterID,
		Resolved:    comment.Resolved,
		CreatedAt:   comment.CreatedAt,
		UpdatedAt:   comment.UpdatedAt,
	})
}
