package v1_common

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

// TODO: Implement the rest of the error types
