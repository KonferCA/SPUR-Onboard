package server

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"KonferCA/SPUR/db"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

const (
	defaultPage  = 1
	defaultLimit = 10
	maxLimit     = 100
)

func validateBody(c echo.Context, requestBodyType interface{}) error {
	if err := c.Bind(requestBodyType); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body :(")
	}
	if err := c.Validate(requestBodyType); err != nil {
		// this will let the global error handler handle
		// the ValidationError and get error string for
		// the each invalid field.
		return err
	}

	return nil
}

func validateUUID(id string, fieldName string) (string, error) {
	if id == "" {
		return "", echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Missing %s ID :(", fieldName))
	}
	if err := uuid.Validate(id); err != nil {
		return "", echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid %s ID format :(", fieldName))
	}

	return id, nil
}

func handleDBError(err error, operation string, resourceType string) error {
	if err == nil {
		return nil
	}

	if isNoRowsError(err) {
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("%s not found :(", resourceType))
	}

	fmt.Printf("Database error during %s %s: %v\n", operation, resourceType, err)

	return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to %s %s :(", operation, resourceType))
}

func isNoRowsError(err error) bool {
	if err == nil {
		return false
	}
	errMsg := err.Error()
	return errMsg == "no rows in result set" ||
		errMsg == "no rows in dis set" ||
		errMsg == "scanning empty row"
}

func numericFromFloat(f float64) pgtype.Numeric {
	var num pgtype.Numeric
	num.Scan(f)
	return num
}

func validateNumeric(value string) (pgtype.Numeric, error) {
	var num pgtype.Numeric
	err := num.Scan(value)
	if err != nil {
		return num, echo.NewHTTPError(http.StatusBadRequest, "Invalid numeric value :(")
	}

	return num, nil
}

func validateTimestamp(timeStr string, fieldName string) (*time.Time, error) {
	if timeStr == "" {
		return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Missing %s :(", fieldName))
	}

	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid %s format :(", fieldName))
	}

	return &parsedTime, nil
}

func validateTimeRange(startTime, endTime time.Time) error {
	if endTime.Before(startTime) {
		return echo.NewHTTPError(http.StatusBadRequest, "End time cannot be before start time :(")
	}

	return nil
}

var allowedSignupRoles = map[db.UserRole]bool{
	db.UserRole("startup_owner"): true,
	db.UserRole("investor"):      true,
}

func validateSignupRole(role db.UserRole) error {
	if !allowedSignupRoles[role] {
		return fmt.Errorf("invalid role for signup: %s", role)
	}

	return nil
}

func getPageParam(c echo.Context) int {
	pageStr := c.QueryParam("page")
	if pageStr == "" {
		return defaultPage
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		return defaultPage
	}

	return page
}

func getLimitParam(c echo.Context) int {
	limitStr := c.QueryParam("limit")
	if limitStr == "" {
		return defaultLimit
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		return defaultLimit
	}

	if limit > maxLimit {
		return maxLimit
	}

	return limit
}
