package server

import (
	"KonferCA/SPUR/internal/v1/v1_common"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

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
		details string
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
		fieldErrors := make(map[string]map[string]interface{})

		for _, err := range e {
			fieldName := strings.ToLower(err.Field())
			fieldErrors[fieldName] = map[string]interface{}{
				"tag":       err.Tag(),
				"value":     err.Value(),
				"condition": err.Param(),
			}
		}

		detailsBytes, err := json.Marshal(fieldErrors)
		if err != nil {
			details = "error formatting validation details"
			log.Error().Err(err).Msg("failed to format validation details")
		} else {
			details = string(detailsBytes)
		}
	case *v1_common.APIError:
		code = e.Code
		errType = e.Type
		message = e.Message
		details = e.Details
	default:
		if internalErr != nil {
			log.Error().Err(internalErr).Msg("internal error occurred")
		} else {
			log.Error().Err(err).Msg("unexpected error occurred")
		}
		details = "an unexpected error occurred. please try again later"
	}

	requestID := c.Request().Header.Get(echo.HeaderXRequestID)

	// log with more context
	logContext := log.With().
		Str("request_error", fmt.Sprintf("code=%d, message=%s", code, message)).
		Str("request_id", requestID).
		Str("method", c.Request().Method).
		Str("path", c.Request().URL.Path).
		Int("status", code).
		Str("user_agent", c.Request().UserAgent())

	if internalErr != nil {
		logContext = logContext.Str("error", internalErr.Error())
	} else if err != nil && code == http.StatusInternalServerError {
		logContext = logContext.Str("error", err.Error())
	}

	logger := logContext.Logger()
	logger.Error().Msg("request error")

	apiError := &v1_common.APIError{
		Type:      errType,
		Message:   message,
		Details:   details,
		RequestID: requestID,
		Code:      code,
	}

	if !c.Response().Committed {
		if err := c.JSON(code, apiError); err != nil {
			log.Error().Err(err).Msg("failed to send error response")
		}
	}
}
