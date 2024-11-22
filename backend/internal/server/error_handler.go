package server

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

type ErrorResponse struct {
	Status    int      `json:"status"`
	Message   string   `json:"message"`
	RequestID string   `json:"request_id,omitempty"`
	Errors    []string `json:"errors,omitempty"`
}

func globalErrorHandler(err error, c echo.Context) {
	req := c.Request()
	requestID := req.Header.Get(echo.HeaderXRequestID)

	// default error response
	status := http.StatusInternalServerError
	message := "internal server error"
	var validationErrors []string

	// handle different error types
	switch e := err.(type) {
	case *echo.HTTPError:
		status = e.Code
		message = e.Message.(string)

	case validator.ValidationErrors:
		// handle validation errors specially
		status = http.StatusBadRequest
		message = "validation failed"
		validationErrors = make([]string, len(e))
		for i, err := range e {
			validationErrors[i] = err.Error()
		}

	case error:
		message = e.Error()
	}

	// log with more context
	logger := log.Error()
	if status < 500 {
		logger = log.Warn()
	}

	logger.
		Err(err).
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
