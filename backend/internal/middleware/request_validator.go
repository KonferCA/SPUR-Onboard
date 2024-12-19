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

type CustomValidator struct {
	validator *validator.Validate
}

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

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		log.Error().Err(err).Msg("validation error")

		return echo.NewHTTPError(http.StatusBadRequest, formatValidationErrors(err))
	}

	return nil
}

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

func validateNonAdminRole(fl validator.FieldLevel) bool {
	field := fl.Field()

	if field.Type() == reflect.TypeOf(db.UserRole("")) {
		ur := field.Interface().(db.UserRole)

		return ur.Valid() && ur != db.UserRoleAdmin
	}

	if field.Kind() == reflect.String {
		ur := db.UserRole(field.String())

		return ur.Valid() && ur != db.UserRoleAdmin
	}

	return false
}

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

func validateWalletAddress(fl validator.FieldLevel) bool {
	address := fl.Field().String()

	// address is an optional field - return true on empty str
	if address == "" {
		return true
	}

	matched, _ := regexp.MatchString("^0x[0-9a-fA-F]{64}$", address)

	return matched
}

func validateLinkedInURL(fl validator.FieldLevel) bool {
	url := fl.Field().String()
	matched, _ := regexp.MatchString(`^https?:\/\/(www\.)?linkedin\.com\/.*$`, url)

	return matched
}

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
	// To be used in request types - i.e in passwords, bio etc
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, param)
	// To be used in request types - i.e in passwords, bio etc
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", field, param)
	default:
		return fmt.Sprintf("%s failed validation for %s", field, tag)
	}
}
