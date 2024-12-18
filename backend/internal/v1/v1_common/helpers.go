package v1common

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

/*
Basic helper that response with the basic response json.
To use a default message, pass an empty string.

Example:

	func handler(c echo.Context) error
	    // some code...
	    return success(c, http.StatusOk, "Something")
	}
*/
func success(c echo.Context, code int, message string) error {
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
	    return fail(c, http.StatusNotFound, "Something not found", err)
	}
*/
func fail(c echo.Context, code int, publicErrMsg string, internalErr error) error {
	c.Set("internal_error", internalErr)
	if publicErrMsg == "" {
		publicErrMsg = http.StatusText(code)
	}
	return echo.NewHTTPError(code, publicErrMsg)
}
