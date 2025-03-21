package v1_common

import (
	"KonferCA/SPUR/internal/permissions"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// Common time format constants
const (
	DateOnlyFormat = "2006-01-02"
)

// FormatUnixTime converts a Unix timestamp to RFC3339 format
func FormatUnixTime(t int64) string {
	return time.Unix(t, 0).Format(time.RFC3339)
}

// FormatUnixTimeCustom converts a Unix timestamp to a custom format
// For example, use DateOnlyFormat for YYYY-MM-DD format
func FormatUnixTimeCustom(t int64, layout string) string {
	return time.Unix(t, 0).Format(layout)
}

/*
Basic helper that response with the basic response json.
To use a default message, pass an empty string.

Example:

	func handler(c echo.Context) error
	    // some code...
	    return Success(c, http.StatusOk, "Something")
	}
*/
func Success(c echo.Context, code int, message string) error {
	if message == "" {
		message = http.StatusText(code)
	}

	return c.JSON(code, APISuccess{
		Type:    SuccessTypeOK,
		Message: message,
		Code:    code,
	})
}

/*
Helper that sets some of fields for the underlying error handler
to properly log/handle the error response.

If no internal error to pass, use nil. It is recommended to always pass
an error so that the underlying error handler can log the error.

To use a default public message, pass an empty string.

Example:

	func handler(c echo.Context) error
	    // some code...
	    return Fail(c, http.StatusNotFound, "Something not found", err)
	}
*/
func Fail(c echo.Context, code int, publicErrMsg string, internalErr error) error {
	c.Set("internal_error", internalErr)
	if publicErrMsg == "" {
		publicErrMsg = http.StatusText(code)
	}

	errorType := DetermineErrorType(code)

	return &APIError{
		Type:    errorType,
		Message: publicErrMsg,
		Details: GetErrorDetails(internalErr),
		Code:    code,
	}
}

/*
Helper function to determine the error type based on the http status code.

Returns the error type.
*/
func DetermineErrorType(code int) ErrorType {
	switch code {
	case http.StatusBadRequest:
		return ErrorTypeBadRequest
	case http.StatusUnauthorized:
		return ErrorTypeAuth
	case http.StatusForbidden:
		return ErrorTypeForbidden
	case http.StatusNotFound:
		return ErrorTypeNotFound
	case http.StatusServiceUnavailable:
		return ErrorTypeUnavailable
	default:
		return ErrorTypeInternal
	}
}

/*
Helper function to get the error details.

Returns the error details as a string.
*/
func GetErrorDetails(err error) string {
	if err == nil {
		return ""
	}

	return err.Error()
}

/*
BindAndValidate binds the request body to a struct and validates it.

Returns an error if either binding or validation fails.
*/
func BindandValidate(c echo.Context, req interface{}) error {
	if err := c.Bind(req); err != nil {
		return NewValidationError("invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return NewValidationError(err.Error())
	}

	return nil
}

/*
Helper that gets the user id from the context.

Returns an error if the user id is not found in the context.
*/
func GetUserID(c echo.Context) (uuid.UUID, error) {
	userID, ok := c.Get("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, NewAuthError("user id not found in context")
	}

	return userID, nil
}

/*
Helper that gets the user permissions from the context.

Returns an error if the user permissions are not found in the context.
*/
func GetUserPermissions(c echo.Context) (uint32, error) {
	userPerms, ok := c.Get("user_permissions").(uint32)
	if !ok {
		return 0, NewAuthError("user permissions not found in context")
	}

	return userPerms, nil
}

/*
Helper that checks if the user has admin permissions.

Returns true if the user has admin permissions, false otherwise.
*/
func IsAdmin(c echo.Context) bool {
	perms, err := GetUserPermissions(c)
	if err != nil {
		return false
	}
	// Check if user has all admin permissions
	return permissions.HasAllPermissions(perms,
		permissions.PermViewAllProjects,
		permissions.PermReviewProjects,
		permissions.PermManageUsers,
		permissions.PermManagePermissions,
	)
}

/*
Helper that checks if the user has startup owner permissions.

Returns true if the user has startup owner permissions, false otherwise.
*/
func IsStartupOwner(c echo.Context) bool {
	perms, err := GetUserPermissions(c)
	if err != nil {
		return false
	}
	return permissions.HasAllPermissions(perms,
		permissions.PermSubmitProject,
		permissions.PermManageDocuments,
	)
}

/*
Helper that checks if the user has investor permissions.

Returns true if the user has investor permissions, false otherwise.
*/
func IsInvestor(c echo.Context) bool {
	perms, err := GetUserPermissions(c)
	if err != nil {
		return false
	}
	return permissions.HasAllPermissions(perms,
		permissions.PermViewAllProjects,
		permissions.PermCommentOnProjects,
		permissions.PermInvestInProjects,
	)
}

/*
Helper that checks if the route requires admin permissions.

Returns an error if the user doesn't have admin permissions.
*/
func RequireAdmin(c echo.Context) error {
	if !IsAdmin(c) {
		return NewForbiddenError("Admin access required")
	}
	return nil
}

/*
Helper that checks if the user has all the required permissions.

Returns an error if the user doesn't have all the required permissions.
*/
func RequirePermissions(c echo.Context, requiredPerms ...uint32) error {
	userPerms, err := GetUserPermissions(c)
	if err != nil {
		return err
	}
	if !permissions.HasAllPermissions(userPerms, requiredPerms...) {
		return NewForbiddenError("Insufficient permissions")
	}
	return nil
}

/*
Helper that checks if the user has any of the required permissions.

Returns an error if the user doesn't have any of the required permissions.
*/
func RequireAnyPermission(c echo.Context, requiredPerms ...uint32) error {
	userPerms, err := GetUserPermissions(c)
	if err != nil {
		return err
	}
	if !permissions.HasAnyPermission(userPerms, requiredPerms...) {
		return NewForbiddenError("Insufficient permissions")
	}
	return nil
}
