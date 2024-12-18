package middleware

import (
	"KonferCA/SPUR/db"
	"fmt"
	"net/http"
	"os"
	"reflect"
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

	return &CustomValidator{validator: v}
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		log.Error().Err(err).Msg("validation error")

		// TODO: Implement custom error messages
		return echo.NewHTTPError(http.StatusBadRequest, "err")
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
