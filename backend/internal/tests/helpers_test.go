package tests

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/v1/v1_common"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

// Test struct with validation tags
type testRequest struct {
	Name          string      `json:"name" validate:"required"`
	Email         string      `json:"email" validate:"required,email"`
	Role          db.UserRole `json:"role" validate:"valid_user_role"`
	WalletAddress string      `json:"wallet_address" validate:"wallet_address"`
	LinkedInURL   string      `json:"linkedin_url" validate:"linkedin_url"`
}

func TestSuccess(t *testing.T) {
	tests := []struct {
		name         string
		code         int
		message      string
		expectedCode int
		expectedBody v1_common.BasicResponse
	}{
		{
			name:         "with custom message",
			code:         http.StatusOK,
			message:      "test message",
			expectedCode: http.StatusOK,
			expectedBody: v1_common.BasicResponse{Message: "test message"},
		},
		{
			name:         "with empty message",
			code:         http.StatusCreated,
			message:      "",
			expectedCode: http.StatusCreated,
			expectedBody: v1_common.BasicResponse{Message: http.StatusText(http.StatusCreated)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := v1_common.Success(c, tt.code, tt.message)
			assert.NoError(t, err)

			var gotBody v1_common.BasicResponse
			err = json.NewDecoder(rec.Body).Decode(&gotBody)
			assert.NoError(t, err)

			assert.Equal(t, tt.expectedCode, rec.Code)
			assert.Equal(t, tt.expectedBody, gotBody)
		})
	}
}

func TestFail(t *testing.T) {
	tests := []struct {
		name            string
		code            int
		publicErrMsg    string
		internalErr     error
		expectedCode    int
		expectedType    v1_common.ErrorType
		expectedMsg     string
		expectedDetails string
	}{
		{
			name:            "with custom message and internal error",
			code:            http.StatusBadRequest,
			publicErrMsg:    "invalid input",
			internalErr:     errors.New("validation failed"),
			expectedCode:    http.StatusBadRequest,
			expectedType:    v1_common.ErrorTypeBadRequest,
			expectedMsg:     "invalid input",
			expectedDetails: "validation failed",
		},
		{
			name:            "with empty message",
			code:            http.StatusNotFound,
			publicErrMsg:    "",
			internalErr:     nil,
			expectedCode:    http.StatusNotFound,
			expectedType:    v1_common.ErrorTypeNotFound,
			expectedMsg:     http.StatusText(http.StatusNotFound),
			expectedDetails: "",
		},
		{
			name:            "unauthorized error",
			code:            http.StatusUnauthorized,
			publicErrMsg:    "not authorized",
			internalErr:     errors.New("token expired"),
			expectedCode:    http.StatusUnauthorized,
			expectedType:    v1_common.ErrorTypeAuth,
			expectedMsg:     "not authorized",
			expectedDetails: "token expired",
		},
		{
			name:            "forbidden error",
			code:            http.StatusForbidden,
			publicErrMsg:    "access denied",
			internalErr:     nil,
			expectedCode:    http.StatusForbidden,
			expectedType:    v1_common.ErrorTypeForbidden,
			expectedMsg:     "access denied",
			expectedDetails: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := v1_common.Fail(c, tt.code, tt.publicErrMsg, tt.internalErr)

			apiErr, ok := err.(*v1_common.APIError)
			assert.True(t, ok, "Expected APIError type")
			if ok {
				assert.Equal(t, tt.expectedCode, apiErr.Code)
				assert.Equal(t, tt.expectedType, apiErr.Type)
				assert.Equal(t, tt.expectedMsg, apiErr.Message)
				assert.Equal(t, tt.expectedDetails, apiErr.Details)
			}

			if tt.internalErr != nil {
				contextErr, ok := c.Get("internal_error").(error)
				assert.True(t, ok)
				assert.Equal(t, tt.internalErr, contextErr)
			}
		})
	}
}

func TestBindAndValidate(t *testing.T) {
	e := echo.New()
	validator := middleware.NewRequestValidator()
	e.Validator = validator

	tests := []struct {
		name        string
		body        string
		expectError bool
		checkError  func(*testing.T, error)
	}{
		{
			name: "valid request",
			body: `{
                "name": "test",
                "email": "test@example.com",
                "role": "startup_owner",
                "wallet_address": "0x1234567890123456789012345678901234567890123456789012345678901234",
                "linkedin_url": "https://linkedin.com/in/test"
            }`,
			expectError: false,
		},
		{
			name:        "invalid json",
			body:        `{"name": }`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				assert.Equal(t, "invalid request body", err.Error())
			},
		},
		{
			name:        "missing required fields",
			body:        `{}`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				validationErr := err.Error()
				assert.Contains(t, validationErr, "Name")
				assert.Contains(t, validationErr, "required")
			},
		},
		{
			name: "invalid email",
			body: `{
                "name": "test",
                "email": "invalid-email",
                "role": "startup_owner"
            }`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "Email")
				assert.Contains(t, err.Error(), "valid email")
			},
		},
		{
			name: "invalid role",
			body: `{
                "name": "test",
                "email": "test@example.com",
                "role": "invalid_role"
            }`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "Role")
				assert.Contains(t, err.Error(), "valid user role")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			var testReq testRequest
			err := v1_common.BindandValidate(c, &testReq)

			if tt.expectError {
				if tt.checkError != nil {
					tt.checkError(t, err)
				} else {
					assert.Error(t, err)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUserContext(t *testing.T) {
	tests := []struct {
		name         string
		setupContext func(echo.Context)
		testFunc     func(echo.Context) error
		expectError  bool
		checkResult  func(*testing.T, interface{}, error)
	}{
		{
			name: "get valid user id",
			setupContext: func(c echo.Context) {
				id := uuid.New()
				c.Set("user_id", id)
			},
			testFunc: func(c echo.Context) error {
				_, err := v1_common.GetUserID(c)
				return err
			},
			expectError: false,
		},
		{
			name:         "get invalid user id",
			setupContext: func(c echo.Context) {},
			testFunc: func(c echo.Context) error {
				_, err := v1_common.GetUserID(c)
				return err
			},
			expectError: true,
		},
		{
			name: "get valid user role",
			setupContext: func(c echo.Context) {
				c.Set("user_role", db.UserRoleAdmin)
			},
			testFunc: func(c echo.Context) error {
				_, err := v1_common.GetUserRole(c)
				return err
			},
			expectError: false,
		},
		{
			name:         "get invalid user role",
			setupContext: func(c echo.Context) {},
			testFunc: func(c echo.Context) error {
				_, err := v1_common.GetUserRole(c)
				return err
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			tt.setupContext(c)
			err := tt.testFunc(c)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestAdminChecks(t *testing.T) {
	tests := []struct {
		name         string
		setupContext func(echo.Context)
		expectAdmin  bool
		expectError  bool
	}{
		{
			name: "is admin",
			setupContext: func(c echo.Context) {
				c.Set("user_role", db.UserRoleAdmin)
			},
			expectAdmin: true,
			expectError: false,
		},
		{
			name: "not admin",
			setupContext: func(c echo.Context) {
				c.Set("user_role", db.UserRoleStartupOwner)
			},
			expectAdmin: false,
			expectError: true,
		},
		{
			name:         "no role",
			setupContext: func(c echo.Context) {},
			expectAdmin:  false,
			expectError:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			tt.setupContext(c)

			isAdmin := v1_common.IsAdmin(c)
			assert.Equal(t, tt.expectAdmin, isAdmin)

			err := v1_common.RequireAdmin(c)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
