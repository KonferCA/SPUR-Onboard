package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/service"
	"KonferCA/SPUR/internal/v1/v1_common"
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
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
		if err == pgx.ErrNoRows {
			return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
		}
	}

	comments, err := h.server.GetQueries().GetProjectComments(c.Request().Context(), project.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project comments", err)
	}

	// Convert to response format
	response := make([]CommentResponse, len(comments))
	for i, comment := range comments {
		var snapshotID *string = nil
		if comment.ResolvedBySnapshotID.Valid {
			uuid := comment.ResolvedBySnapshotID.String()
			snapshotID = &uuid
		}

		response[i] = CommentResponse{
			ID:                   comment.ID,
			ProjectID:            comment.ProjectID,
			TargetID:             comment.TargetID,
			Comment:              comment.Comment,
			CommenterID:          comment.CommenterID,
			CreatedAt:            comment.CreatedAt,
			UpdatedAt:            comment.UpdatedAt,
			CommenterFirstName:   comment.CommenterFirstName,
			CommenterLastName:    comment.CommenterLastName,
			Resolved:             comment.Resolved,
			ResolvedBySnapshotID: snapshotID,
			ResolvedBySnapshotAt: comment.ResolvedBySnapshotAt,
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

	var snapshotID *string = nil
	if comment.ResolvedBySnapshotID.Valid {
		uuid := comment.ResolvedBySnapshotID.String()
		snapshotID = &uuid
	}

	response := CommentResponse{
		ID:                   comment.ID,
		ProjectID:            comment.ProjectID,
		TargetID:             comment.TargetID,
		Comment:              comment.Comment,
		CommenterID:          comment.CommenterID,
		CreatedAt:            comment.CreatedAt,
		UpdatedAt:            comment.UpdatedAt,
		CommenterFirstName:   comment.CommenterFirstName,
		CommenterLastName:    comment.CommenterLastName,
		Resolved:             comment.Resolved,
		ResolvedBySnapshotID: snapshotID,
		ResolvedBySnapshotAt: comment.ResolvedBySnapshotAt,
	}

	return c.JSON(http.StatusOK, response)
}

// handleCreateProjectComment handles creating comments request.
//
// Security: only admin users are allowed
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

	// Ensure that the handler is checking for permissions instead of solely relying on
	// middleware. This ensures that the permission is strictly followed.
	if user.Permissions&int32(permissions.PermIsAdmin) == 0 {
		return v1_common.NewAuthError("Unauthorized to create a new comment on project.")
	}
  
	// Request should not take longer than one minute to process
	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// Begin transaction because the flag 'allow_edit' in the projects table
	// needs to be set upon successful creation of a comment.
	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.NewInternalError(err)
	}
	defer tx.Rollback(ctx)

	queries := h.server.GetQueries().WithTx(tx)

	// Get company owned by user
	company, err := queries.GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	// Verify project exists using admin query
	_, err = queries.GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
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

	// Create comment and set 'allow_edit' flag
	comment, err := service.CreateProjectComment(queries, ctx, db.CreateProjectCommentParams{
		ProjectID:   projectID,
		TargetID:    req.TargetID,
		Comment:     req.Comment,
		CommenterID: user.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create comment", err)
	}

	// Commit changes
	if err := tx.Commit(ctx); err != nil {
		return v1_common.NewInternalError(err)
	}

	response := CommentResponse{
		ID:                   comment.ID,
		ProjectID:            comment.ProjectID,
		TargetID:             comment.TargetID,
		Comment:              comment.Comment,
		CommenterID:          comment.CommenterID,
		CommenterFirstName:   user.FirstName,
		CommenterLastName:    user.LastName,
		Resolved:             comment.Resolved,
		CreatedAt:            comment.CreatedAt,
		UpdatedAt:            comment.UpdatedAt,
		ResolvedBySnapshotID: nil,
		ResolvedBySnapshotAt: nil,
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

	queries := h.server.GetQueries()

	// Get authenticated user
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// Check if user has admin permission
	if uint32(user.Permissions)&permissions.PermIsAdmin == 0 {
		// If regular startup owner, check for ownership of the project
		company, err := queries.GetCompanyByOwnerID(ctx, user.ID)
		if err != nil {
			if err == sql.ErrNoRows {
				return v1_common.Fail(c, http.StatusBadRequest, "Company missing in database. Please contact support.", err)
			}
			return v1_common.NewInternalError(err)
		}

		// If this query doesn't error, then the project existsi and its owned by the user's company
		_, err = queries.GetProjectByID(ctx, db.GetProjectByIDParams{
			ID:        projectID,
			CompanyID: company.ID,
		})
		if err != nil {
			if err == sql.ErrNoRows {
				return v1_common.Fail(c, http.StatusBadRequest, "Can't resolve comment for non-existing project.", err)
			}
			return v1_common.NewInternalError(err)
		}
	}

	oldComment, err := queries.GetProjectComment(ctx, db.GetProjectCommentParams{
		ID:        commentID,
		ProjectID: projectID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, http.StatusNotFound, "Comment not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to resolve comment", err)
	}
	if oldComment.ResolvedBySnapshotID.Valid {
		return v1_common.Fail(c, http.StatusBadRequest, "This comment has been resolved by a previous submission and it can't be modified.", nil)
	}

	// Resolve the comment
	comment, err := queries.ResolveProjectComment(ctx, db.ResolveProjectCommentParams{
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

	queries := h.server.GetQueries()

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// Check if user has admin permission
	if uint32(user.Permissions)&permissions.PermIsAdmin == 0 {
		// If regular startup owner, check for ownership of the project
		company, err := queries.GetCompanyByOwnerID(ctx, user.ID)
		if err != nil {
			if err == sql.ErrNoRows {
				return v1_common.Fail(c, http.StatusBadRequest, "Company missing in database. Please contact support.", err)
			}
			return v1_common.NewInternalError(err)
		}

		// If this query doesn't error, then the project existsi and its owned by the user's company
		_, err = queries.GetProjectByID(ctx, db.GetProjectByIDParams{
			ID:        projectID,
			CompanyID: company.ID,
		})
		if err != nil {
			if err == sql.ErrNoRows {
				return v1_common.Fail(c, http.StatusBadRequest, "Can't resolve comment for non-existing project.", err)
			}
			return v1_common.NewInternalError(err)
		}
	}

	oldComment, err := queries.GetProjectComment(ctx, db.GetProjectCommentParams{
		ID:        commentID,
		ProjectID: projectID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, http.StatusNotFound, "Comment not found", err)
		}
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to resolve comment", err)
	}
	if oldComment.ResolvedBySnapshotID.Valid {
		return v1_common.Fail(c, http.StatusBadRequest, "This comment has been resolved by a previous submission and it can't be modified.", nil)
	}

	// Unresolve the comment
	comment, err := queries.UnresolveProjectComment(ctx, db.UnresolveProjectCommentParams{
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
