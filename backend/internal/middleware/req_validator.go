package middleware

import (
	"fmt"
	"net/http"
	"os"
	"reflect"
	"strings"

	"KonferCA/SPUR/db"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

const REQUEST_BODY_KEY = "MIDDLEWARE_REQUEST_BODY"

// Struct solely exists to comply with Echo's interface to add a custom validator...
type RequestBodyValidator struct {
	validator *validator.Validate
}

func (rv *RequestBodyValidator) Validate(i interface{}) error {
	if err := rv.validator.Struct(i); err != nil {
		log.Error().Err(err).Msg("Validation error")
		return err
	}

	return nil
}

// Creates a new request validator that can be set to an Echo instance
// and used for validating request bodies with c.Validate()
func NewRequestBodyValidator() *RequestBodyValidator {
	v := validator.New()
	v.RegisterValidation("valid_user_role", validateUserRole)
	v.RegisterValidation("non_admin_role", validateNonAdminRole)
	v.RegisterValidation("s3_url", validateS3URL)
	return &RequestBodyValidator{validator: v}
}

// Middleware that validates the incoming request body with the given structType.
func ValidateRequestBody(structType reflect.Type) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			reqStruct := reflect.New(structType)

			if err := c.Bind(reqStruct.Interface()); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid request body: %v", err))
			}

			if err := c.Validate(reqStruct.Interface()); err != nil {
				// this will let the global error handler handle
				// the ValidationError and get error string for
				// the each invalid field.
				return err
			}

			// allow the remaining handlers in the chain gain access to
			// the request body.
			c.Set(REQUEST_BODY_KEY, reqStruct.Interface())

			return next(c)
		}
	}
}

// validateUserRole validates the "valid_user_role" tag using the
// the generated valid method from SQLc.
func validateUserRole(fl validator.FieldLevel) bool {
	field := fl.Field()

	// handle string type
	if field.Kind() == reflect.String {
		str := field.String()
		ur := db.UserRole(str)
		return ur.Valid()
	}

	// handle db.UserRole type
	if field.Type() == reflect.TypeOf(db.UserRole("")) {
		ur := field.Interface().(db.UserRole)
		return ur.Valid()

	}

	// handle pointer to db.UserRole
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

// validateS3URL ensures that file URLs point to our S3 bucket
func validateS3URL(fl validator.FieldLevel) bool {
	url := fl.Field().String()
	bucket := os.Getenv("AWS_S3_BUCKET")
	if bucket == "" {
		log.Warn().Msg("AWS_S3_BUCKET environment variable not set")
		return false
	}
	expectedPrefix := fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/", bucket)
	return strings.HasPrefix(url, expectedPrefix)
}
