package server

import (
	"KonferCA/SPUR/internal/v1/v1_common"
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
Global error handler for all incoming requests to the server.
It handles base error types, echo.HTTPError and validator.ValidationErrors.
The handler logs any error set in the echo.Context of the request with key "internal_error".

The error handler tries to respond with ErrorReponse as body if the request
has not been committed. In case the response fails, it would log the error.

Example:

	e := echo.New()
	e.HTTPErrorHandler = errorHandler

	e.GET("/", func (c echo.Context) error {
	    return echo.NewHTTPError(http.statusBadRequest, "my bad")
	})
*/
func errorHandler(err error, c echo.Context) {
	var (
		code    = http.StatusInternalServerError
		message = "internal server error"
		errType = v1_common.ErrorTypeInternal
		details = ""
	)

	internalErr, _ := c.Get("internal_error").(error)

	// handle different error types
	switch e := err.(type) {
	case *echo.HTTPError:
		code = e.Code
		errType = v1_common.DetermineErrorType(code)
		if msg, ok := e.Message.(string); ok {
			message = msg
		} else {
			message = http.StatusText(code)
		}
	case validator.ValidationErrors:
		code = http.StatusBadRequest
		errType = v1_common.ErrorTypeValidation
		message = "validation failed"
		details = e.Error()
	case *v1_common.APIError:
		code = e.Code
		errType = e.Type
		message = e.Message
		details = e.Details
	default:
		if internalErr != nil {
			details = internalErr.Error()
		} else {
			details = err.Error()
		}
	}

	requestID := c.Request().Header.Get(echo.HeaderXRequestID)

	// log with more context
	logger := log.With().
		Str("request_error", fmt.Sprintf("code=%d, message=%s", code, message)).
		Str("request_id", c.Response().Header().Get(echo.HeaderXRequestID)).
		Str("method", c.Request().Method).
		Str("path", c.Request().URL.Path).
		Int("status", code).
		Str("user_agent", c.Request().UserAgent()).
		Logger()

	if internalErr != nil {
		logger = logger.With().Err(internalErr).Logger()
	}

	logger.Error().Msg("request error")

	apiError := &v1_common.APIError{
		Type:      errType,
		Message:   message,
		Details:   details,
		RequestID: requestID,
		Code:      code,
	}

	if !c.Response().Committed {
		c.Response().WriteHeader(code)
		_ = c.JSON(code, apiError)
	}
}
