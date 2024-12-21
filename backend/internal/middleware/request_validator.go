package middleware

import (
	"KonferCA/SPUR/db"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
walletAddressPattern is a regular expression pattern for validating cryptocurrency wallet addresses.
It matches the format: 0x followed by 64 hexadecimal characters.

linkedinURLPattern is a regular expression pattern for validating LinkedIn profile URLs.
It matches URLs that start with http:// or https:// and contain linkedin.com domain.
*/
var (
	walletAddressPattern = regexp.MustCompile("^0x[0-9a-fA-F]{64}$")
	linkedInURLPattern   = regexp.MustCompile(`^https?:\/\/(www\.)?linkedin\.com\/.*$`)
)

/*
CustomValidator is a wrapper around the go-playground/validator package.
It provides custom validation rules for various fields and types used in the application.
*/
type CustomValidator struct {
	validator *validator.Validate
}

/*
NewRequestValidator creates and initializes a new CustomValidator with registered custom validation rules. The following custom validations are registered:
  - valid_user_role: Validates user role assignments
  - non_admin_role: Ensures role is valid but not admin
  - s3_url: Validates S3 bucket URLs
  - wallet_address: Validates cryptocurrency wallet addresses
  - linkedin_url: Validates LinkedIn profile URLs
  - project_status: Validates project status values

Returns a configured CustomValidator
*/
func NewRequestValidator() *CustomValidator {
	v := validator.New()

	v.RegisterValidation("valid_user_role", validateUserRole)
	v.RegisterValidation("non_admin_role", validateNonAdminRole)
	v.RegisterValidation("s3_url", validateS3URL)
	v.RegisterValidation("wallet_address", validateWalletAddress)
	v.RegisterValidation("linkedin_url", validateLinkedInURL)
	v.RegisterValidation("project_status", validateProjectStatus)

	return &CustomValidator{validator: v}
}

/*
Validate implements the Validator interface (Echo). It performs structural validation of any interface{} using the registered validation rules.

If validation fails, it returns an HTTP 400 Bad Request error with formatted validation error messages. Otherwise, returns nil for successful validation.
*/
func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		log.Error().Err(err).Msg("validation error")

		return echo.NewHTTPError(http.StatusBadRequest, formatValidationErrors(err))
	}

	return nil
}

/*
validateUserRole checks if a field contains a valid user role.
Supports validation of string fields, UserRole types, and UserRole pointers.

Returns true if the field contains a valid user role, false otherwise.
*/
func validateUserRole(fl validator.FieldLevel) bool {
	field := fl.Field()

	if field.Kind() == reflect.String {
		str := field.String()
		ur := db.UserRole(str)

		return ur.Valid()
	}

	if field.Type() == reflect.TypeOf(db.UserRole("")) {
		ur := field.Interface().(db.UserRole)

		return ur.Valid()
	}

	if field.Type() == reflect.TypeOf((*db.UserRole)(nil)) && !field.IsNil() {
		ur := field.Interface().(*db.UserRole)

		return ur.Valid()
	}

	return false
}

/*
validateNonAdminRole ensures a field contains a valid non-admin user role.
Supports validation of both string fields and UserRole types.

Returns true if the field contains a valid non-admin role, false otherwise.
*/
func validateNonAdminRole(fl validator.FieldLevel) bool {
	field := fl.Field()

	if field.Kind() == reflect.String {
		ur := db.UserRole(field.String())

		return ur == db.UserRoleStartupOwner || ur == db.UserRoleInvestor
	}

	if field.Type() == reflect.TypeOf(db.UserRole("")) {
		ur := field.Interface().(db.UserRole)

		return ur == db.UserRoleStartupOwner || ur == db.UserRoleInvestor
	}

	return false
}

/*
validateS3URL verifies that a field contains a valid S3 URL for the configured bucket.
The URL must start with the expected S3 bucket prefix from AWS_S3_BUCKET environment variable.

Returns true if the URL is valid for the configured bucket, false otherwise.
Logs a warning if AWS_S3_BUCKET environment variable is not set.
*/
func validateS3URL(fl validator.FieldLevel) bool {
	url := fl.Field().String()
	bucket := os.Getenv("AWS_S3_BUCKET")

	if bucket == "" {
		log.Warn().Msg("AWS_S3_BUCKET env variable not set")

		return false
	}

	expectedPrefix := fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/", bucket)

	return strings.HasPrefix(url, expectedPrefix)
}

/*
validateWalletAddress verifies that a field contains a valid cryptocurrency wallet address.
The address must be either empty (optional field) or match the format: 0x followed by 64 hexadecimal characters.

Returns true if the address is empty or matches the required format, false otherwise.
*/
func validateWalletAddress(fl validator.FieldLevel) bool {
	address := fl.Field().String()

	// address is an optional field - return true on empty str
	if address == "" {
		return true
	}

	return walletAddressPattern.MatchString(address)
}

/*
validateLinkedInURL verifies that a field contains a valid LinkedIn URL.
The URL must start with http:// or https:// and contain linkedin.com domain.

Returns true if the URL matches LinkedIn's format, false otherwise.
*/
func validateLinkedInURL(fl validator.FieldLevel) bool {
	url := fl.Field().String()

	return linkedInURLPattern.MatchString(url)
}

/*
validateProjectStatus verifies that a field contains a valid project status.
Supports validation of both string fields and ProjectStatus types.

Returns true if the field contains a valid project status, false otherwise.
*/
func validateProjectStatus(fl validator.FieldLevel) bool {
	field := fl.Field()

	if field.Type() == reflect.TypeOf(db.ProjectStatus("")) {
		ps := field.Interface().(db.ProjectStatus)

		return ps.Valid()
	}

	if field.Kind() == reflect.String {
		ps := db.ProjectStatus(field.String())

		return ps.Valid()
	}

	return false
}

/*
formatValidationErrors converts validator.ValidationErrors into a human-readable string.
It processes each validation error and formats it according to the validation tag that failed.

Returns a semicolon-separated string of formatted error messages.
*/
func formatValidationErrors(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		var errorMessages []string

		for _, e := range validationErrors {
			field := e.Field()
			tag := e.Tag()
			param := e.Param()
			message := formatErrorMessage(field, tag, param)
			errorMessages = append(errorMessages, message)
		}

		return strings.Join(errorMessages, "; ")
	}

	return err.Error()
}

/*
formatErrorMessage creates a human-readable error message for a validation failure.
It takes the field name, validation tag, and parameter (if any) and returns an appropriate error message based on the type of validation that failed.

Parameters:
  - field: Name of the field that failed validation
  - tag: Type of validation that failed (e.g., "required", "email", "min")
  - param: Additional parameter for the validation (e.g., minimum length for "min" tag)

Returns a formatted error message string.
*/
func formatErrorMessage(field, tag, param string) string {
	switch tag {
	case "valid_user_role":
		return fmt.Sprintf("%s must be a valid user role", field)
	case "non_admin_role":
		return fmt.Sprintf("%s cannot be an admin role", field)
	case "s3_url":
		return fmt.Sprintf("%s must be a valid S3 URL", field)
	case "wallet_address":
		return fmt.Sprintf("%s must be a valid SUI wallet address", field)
	case "linkedin_url":
		return fmt.Sprintf("%s must be a valid LinkedIn URL", field)
	case "project_status":
		return fmt.Sprintf("%s must be a valid project status", field)
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, param)
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", field, param)
	default:
		return fmt.Sprintf("%s failed validation for %s", field, tag)
	}
}
