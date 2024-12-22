package v1_common

import (
	"KonferCA/SPUR/db"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

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
Helper that gets the user role from the context.

Returns an error if the user role is not found in the context.
*/
func GetUserRole(c echo.Context) (db.UserRole, error) {
	userRole, ok := c.Get("user_role").(db.UserRole)
	if !ok {
		return "", NewAuthError("user role not found in context")
	}

	return userRole, nil
}

/*
Helper that checks if the user is an admin.

Returns true if the user is an admin, false otherwise.
*/
func IsAdmin(c echo.Context) bool {
	role, err := GetUserRole(c)
	if err != nil {
		return false
	}

	return role == db.UserRoleAdmin
}

/*
Helper that checks if the route requires admin access.

Returns an error if the user is not an admin.
*/
func RequireAdmin(c echo.Context) error {
	if !IsAdmin(c) {
		return NewForbiddenError("Admin access required")
	}
	return nil
}
