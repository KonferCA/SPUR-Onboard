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
	return c.JSON(code, basicResponse{Message: message})
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
	return echo.NewHTTPError(code, publicErrMsg)
}

/*
Helper that gets the user id from the context.

Returns an error if the user id is not found in the context.
*/
func GetUserID(c echo.Context) (uuid.UUID, error) {
	userID, ok := c.Get("used_id").(uuid.UUID)
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
