package v1_users

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *Handler) handleUpdateUserDetails(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	var req UpdateUserDetailsRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	q := h.server.GetQueries()

	err := q.UpdateUserDetails(c.Request().Context(), db.UpdateUserDetailsParams{
		FirstName: &req.FirstName,
		LastName:  &req.LastName,
		Title:     &req.Title,
		Bio:       &req.Bio,
		Linkedin:  &req.LinkedIn,
		ID:        userID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Oops something went wrong (2)", err)
	}

	return v1_common.Success(c, http.StatusOK, "User details saved")
}

func (h *Handler) handleGetUserDetails(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	q := h.server.GetQueries()

	details, err := q.GetUserDetails(c.Request().Context(), userID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get user details", err)
	}

	// Format timestamps
	createdAt := time.Unix(details.CreatedAt, 0).Format(time.RFC3339)
	var updatedAt *string
	if details.UpdatedAt != 0 {
		formatted := time.Unix(details.UpdatedAt, 0).Format(time.RFC3339)
		updatedAt = &formatted
	}

	return c.JSON(http.StatusOK, UserDetailsResponse{
		ID:                details.ID,
		FirstName:         details.FirstName,
		LastName:         details.LastName,
		Title:            details.Title,
		Bio:              details.Bio,
		LinkedIn:         details.Linkedin,
		ProfilePictureUrl: details.ProfilePictureUrl,
		CreatedAt:        createdAt,
		UpdatedAt:        updatedAt,
	})
}

func (h *Handler) handleListUsers(c echo.Context) error {
	var req ListUsersRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request parameters: binding error", err)
	}
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request parameters: validation error", err)
	}

	// Set defaults if not provided
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 10
	}

	q := h.server.GetQueries()
	ctx := c.Request().Context()

	// Convert role to permissions
	var permStr string
	if req.Role != "" && req.Role != "all" {
		var perm uint32
		switch req.Role {
		case "admin":
			perm = permissions.PermAdmin
		case "investor":
			perm = permissions.PermInvestor
		case "regular":
			perm = permissions.PermRegular
		default:
			return v1_common.Fail(c, http.StatusBadRequest, "Invalid role", nil)
		}
		permStr = fmt.Sprintf("%d", perm)
	}

	// Get total count
	total, err := q.CountUsers(ctx, db.CountUsersParams{
		Column1: permStr,
		Column2: req.Search,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to count users", err)
	}

	// Get users for current page
	offset := (req.Page - 1) * req.Limit
	users, err := q.ListUsers(ctx, db.ListUsersParams{
		Column1: permStr,
		Column2: req.Search,
		Column3: req.SortOrder,
		Limit:   int32(req.Limit),
		Offset:  int32(offset),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to list users", err)
	}

	// Convert to response format
	var userResponses []UserResponse
	for _, user := range users {
		var updatedAt *int64
		if user.UpdatedAt != 0 {
			updatedAt = &user.UpdatedAt
		}

		// Convert permissions to role
		var role string
		switch uint32(user.Permissions) {
		case permissions.PermAdmin:
			role = "admin"
		case permissions.PermInvestor:
			role = "investor"
		default:
			role = "regular"
		}

		// Format timestamps as RFC3339
		dateJoined := time.Unix(user.CreatedAt, 0).Format(time.RFC3339)
		var lastUpdated *string
		if updatedAt != nil {
			formatted := time.Unix(*updatedAt, 0).Format(time.RFC3339)
			lastUpdated = &formatted
		}

		userResponses = append(userResponses, UserResponse{
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          role,
			Permissions:   uint32(user.Permissions),
			DateJoined:    dateJoined,  // string!! in RFC3339 format
			EmailVerified: user.EmailVerified,
			UpdatedAt:     lastUpdated,  // *string!!!!! in RFC3339 format
		})
	}

	return c.JSON(http.StatusOK, ListUsersResponse{
		Users: userResponses,
		Total: total,
	})
}

func (h *Handler) handleUpdateUserRole(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	var req UpdateUserRoleRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Convert role to permissions
	var newPermissions int32
	switch req.Role {
	case "admin":
		newPermissions = int32(permissions.PermAdmin)
	case "investor":
		newPermissions = int32(permissions.PermInvestor)
	case "regular":
		newPermissions = int32(permissions.PermRegular)
	default:
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid role", nil)
	}

	q := h.server.GetQueries()
	if err := q.UpdateUserRole(c.Request().Context(), db.UpdateUserRoleParams{
		ID:          userID,
		Permissions: newPermissions,
	}); err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update user role", err)
	}

	return v1_common.Success(c, http.StatusOK, "User role updated successfully")
}

func (h *Handler) handleUpdateUsersRole(c echo.Context) error {
	var req UpdateUsersRoleRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Convert role to permissions
	var newPermissions int32
	switch req.Role {
	case "admin":
		newPermissions = int32(permissions.PermAdmin)
	case "investor":
		newPermissions = int32(permissions.PermInvestor)
	case "regular":
		newPermissions = int32(permissions.PermRegular)
	default:
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid role", nil)
	}

	q := h.server.GetQueries()
	if err := q.UpdateUsersRole(c.Request().Context(), db.UpdateUsersRoleParams{
		Column1:     req.UserIDs,
		Permissions: newPermissions,
	}); err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update user roles", err)
	}

	return v1_common.Success(c, http.StatusOK, "User roles updated successfully")
}

func (h *Handler) handleUploadProfilePicture(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	// Get authenticated user from context
	authUser, err := middleware.GetUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Only allow users to update their own profile picture
	if authUser.ID != userID {
		return v1_common.Fail(c, http.StatusForbidden, "Cannot update another user's profile picture", nil)
	}

	// Get the uploaded file
	form := c.Request().MultipartForm
	var file *multipart.FileHeader
	for _, files := range form.File {
		file = files[0]
		break
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to open file", err)
	}
	defer src.Close()

	// Read file content
	fileContent, err := io.ReadAll(src)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to read file", err)
	}

	// Generate S3 key
	fileExt := filepath.Ext(file.Filename)
	s3Key := fmt.Sprintf("users/%s/profile-picture/%s%s", userID, uuid.New().String(), fileExt)

	// Upload to S3
	fileURL, err := h.server.GetStorage().UploadFile(c.Request().Context(), s3Key, fileContent)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to upload file", err)
	}

	// Update user's profile picture URL in database
	err = h.server.GetQueries().UpdateUserProfilePicture(c.Request().Context(), db.UpdateUserProfilePictureParams{
		ProfilePictureUrl: &fileURL,
		ID:               userID,
	})
	if err != nil {
		// Try to cleanup the uploaded file if database update fails
		_ = h.server.GetStorage().DeleteFile(c.Request().Context(), s3Key)
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update profile picture", err)
	}

	return c.JSON(http.StatusOK, UploadProfilePictureResponse{
		URL: fileURL,
	})
}

func (h *Handler) handleRemoveProfilePicture(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request, missing user id", nil)
	}

	// Get authenticated user from context
	authUser, err := middleware.GetUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Only allow users to remove their own profile picture
	if authUser.ID != userID {
		return v1_common.Fail(c, http.StatusForbidden, "Cannot remove another user's profile picture", nil)
	}

	// Update user's profile picture URL in database to null
	err = h.server.GetQueries().UpdateUserProfilePicture(c.Request().Context(), db.UpdateUserProfilePictureParams{
		ProfilePictureUrl: nil,
		ID:               userID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to remove profile picture", err)
	}

	return v1_common.Success(c, http.StatusOK, "Profile picture removed successfully")
}
