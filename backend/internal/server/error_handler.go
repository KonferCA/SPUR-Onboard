package server

import (
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
	req := c.Request()
	internalErr, ok := c.Get("internal_error").(error)
	if !ok {
		internalErr = nil
	}
	requestID := req.Header.Get(echo.HeaderXRequestID)

	// default error response
	status := http.StatusInternalServerError
	message := "internal server error"
	var validationErrors []string

	// handle different error types
	switch e := err.(type) {
	case *echo.HTTPError:
		status = e.Code
		// since the echo.HTTPError allows type any for the
		// message field, we should make sure that it is an
		// actual string that was passed before using it.
		// problems can arise if an struct was passed but
		// not meant to be exposed to the public or
		// is just straight up unreadable.
		if msg, ok := e.Message.(string); ok {
			message = msg
		} else {
			message = http.StatusText(e.Code)
		}

	case validator.ValidationErrors:
		// handle validation errors specially
		status = http.StatusBadRequest
		message = "validation failed"
		validationErrors = make([]string, len(e))
		for i, err := range e {
			validationErrors[i] = err.Error()
		}

	case error:
		// assign the returned error from handlers as the internal error.
		// this is probably an internal error when trying to respond.
		// this ensures that no internal error message gets leaks to the public.
		if internalErr == nil {
			internalErr = err
		}
	}

	// log with more context
	log.
		Error().
		AnErr("internal_error", internalErr).
		AnErr("request_error", err).
		Str("request_id", requestID).
		Str("method", req.Method).
		Str("path", req.URL.Path).
		Int("status", status).
		Str("user_agent", req.UserAgent()).
		Msg("request error")

	// return json response
	if !c.Response().Committed {
		response := ErrorResponse{
			Status:    status,
			Message:   message,
			RequestID: requestID,
		}
		if len(validationErrors) > 0 {
			response.Errors = validationErrors
		}

		if err := c.JSON(status, response); err != nil {
			log.Error().
				Err(err).
				Str("request_id", requestID).
				Msg("failed to send error response")
		}
	}
}
