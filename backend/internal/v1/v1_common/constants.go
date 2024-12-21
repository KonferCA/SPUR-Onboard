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
