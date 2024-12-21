package v1_common

import (
	"fmt"
	"net/http"
)

/*
Common error types for v1
*/
const (
	ErrorTypeValidation  ErrorType = "VALIDATION_ERROR"
	ErrorTypeAuth        ErrorType = "AUTH_ERROR"
	ErrorTypeNotFound    ErrorType = "NOT_FOUND"
	ErrorTypeBadRequest  ErrorType = "BAD_REQUEST"
	ErrorTypeInternal    ErrorType = "INTERNAL_ERROR"
	ErrorTypeUnavailable ErrorType = "SERVICE_UNAVAILABLE"
	ErrorTypeForbidden   ErrorType = "FORBIDDEN"
)

/*
Use this for any json response that just needs a simple message field.
*/
func (e *APIError) Error() string {
	return e.Message
}

/*
NewError creates a new APIError object.
*/
func NewError(errorType ErrorType, code int, message string, details string) *APIError {
	return &APIError{
		Type:    errorType,
		Message: message,
		Details: details,
		Code:    code,
	}
}

/*
NewValidationError creates a new APIError object with type VALIDATION_ERROR.
*/
func NewValidationError(message string) *APIError {
	return NewError(ErrorTypeValidation, http.StatusBadRequest, message, "")
}

/*
NewNotFoundError creates a new APIError object with type NOT_FOUND.
*/
func NewNotFoundError(resource string) *APIError {
	return NewError(ErrorTypeNotFound, http.StatusNotFound, fmt.Sprintf("%s not found", resource), "")
}

/*
NewAuthError creates a new APIError object with type AUTH_ERROR.
*/
func NewAuthError(message string) *APIError {
	return NewError(ErrorTypeAuth, http.StatusUnauthorized, message, "")
}

/*
NewForbiddenError creates a new APIError object with type FORBIDDEN.
*/
func NewForbiddenError(message string) *APIError {
	return NewError(ErrorTypeForbidden, http.StatusForbidden, message, "")
}

/*
NewInternalError creates a new APIError object with type INTERNAL_ERROR.
*/
func NewInternalError(err error) *APIError {
	return NewError(ErrorTypeInternal, http.StatusInternalServerError, "Internal server error", err.Error())
}
