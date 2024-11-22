package middleware

import (
	"fmt"
	"net/http"
	"reflect"

	"github.com/KonferCA/NoKap/db"
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
