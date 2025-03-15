package tests

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	"KonferCA/SPUR/internal/v1/v1_common"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Test struct with validation tags
type testRequest struct {
	Name          string `json:"name" validate:"required"`
	Email         string `json:"email" validate:"required,email"`
	Permissions   uint32 `json:"permissions" validate:"valid_permissions"`
	WalletAddress string `json:"wallet_address" validate:"wallet_address"`
	LinkedInURL   string `json:"linkedin_url" validate:"linkedin_url"`
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
                "permissions": ` + fmt.Sprint(permissions.PermStartupOwner) + `,
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
                "permissions": 32
            }`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "Email")
				assert.Contains(t, err.Error(), "valid email")
			},
		},
		{
			name: "invalid permissions",
			body: `{
                "name": "test",
                "email": "test@example.com",
                "permissions": 0
            }`,
			expectError: true,
			checkError: func(t *testing.T, err error) {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "Permissions")
				assert.Contains(t, err.Error(), "invalid permissions")
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
	setupEnv()
	s := setupTestServer(t)

	t.Run("is_admin", func(t *testing.T) {
		ctx := context.Background()
		userID, email, _, err := createTestUser(ctx, s, permissions.PermAdmin)
		require.NoError(t, err)
		defer removeTestUser(ctx, email, s)

		// Get actual user permissions from database
		var userPerms int32
		err = s.GetDB().QueryRow(ctx, "SELECT permissions FROM users WHERE id = $1", userID).Scan(&userPerms)
		require.NoError(t, err)

		// Test admin check with actual permissions
		isAdmin := permissions.HasAllPermissions(uint32(userPerms),
			permissions.PermViewAllProjects,
			permissions.PermReviewProjects,
			permissions.PermManageUsers,
			permissions.PermManagePermissions,
			permissions.PermCommentOnProjects,
		)
		assert.True(t, isAdmin)
	})

	t.Run("not_admin", func(t *testing.T) {
		ctx := context.Background()
		userID, email, _, err := createTestUser(ctx, s, permissions.PermStartupOwner)
		require.NoError(t, err)
		defer removeTestUser(ctx, email, s)

		// Get actual user permissions from database
		var userPerms int32
		err = s.GetDB().QueryRow(ctx, "SELECT permissions FROM users WHERE id = $1", userID).Scan(&userPerms)
		require.NoError(t, err)

		// Test admin check with actual permissions
		isAdmin := permissions.HasAllPermissions(uint32(userPerms),
			permissions.PermViewAllProjects,
			permissions.PermReviewProjects,
			permissions.PermManageUsers,
			permissions.PermManagePermissions,
			permissions.PermCommentOnProjects,
		)
		assert.False(t, isAdmin)
	})
}

func TestCreateTestUser(t *testing.T) {
	setupEnv()
	s := setupTestServer(t)

	ctx := context.Background()
	userID, email, _, err := createTestUser(ctx, s, permissions.PermStartupOwner)
	require.NoError(t, err)
	defer removeTestUser(ctx, email, s)

	// Verify user exists in database
	var dbUser struct {
		ID            string
		Email         string
		EmailVerified bool
		Permissions   int32
	}
	err = s.GetDB().QueryRow(ctx, `
		SELECT id, email, email_verified, permissions
		FROM users WHERE id = $1
	`, userID).Scan(&dbUser.ID, &dbUser.Email, &dbUser.EmailVerified, &dbUser.Permissions)
	require.NoError(t, err)

	assert.Equal(t, userID, dbUser.ID)
	assert.Equal(t, email, dbUser.Email)
	assert.True(t, dbUser.EmailVerified)
	assert.Equal(t, int32(permissions.PermStartupOwner), dbUser.Permissions)
}

func TestCreateTestAdmin(t *testing.T) {
	setupEnv()
	s, err := server.New()
	require.NoError(t, err)

	ctx := context.Background()
	adminID, email, password, err := createTestAdmin(ctx, s)
	require.NoError(t, err)
	require.NotEmpty(t, adminID)
	require.NotEmpty(t, email)
	require.NotEmpty(t, password)

	// Verify admin permissions
	var adminPerms int32
	err = s.GetDB().QueryRow(ctx, "SELECT permissions FROM users WHERE id = $1", adminID).Scan(&adminPerms)
	require.NoError(t, err)

	// Compare with all expected admin permissions
	expectedPerms := int32(permissions.PermAdmin | permissions.PermManageUsers | permissions.PermViewAllProjects |
		permissions.PermManageTeam | permissions.PermCommentOnProjects | permissions.PermSubmitProject)
	require.Equal(t, expectedPerms, adminPerms)
}

func TestLoginAndGetToken(t *testing.T) {
	setupEnv()
	s, err := server.New()
	require.NoError(t, err)

	ctx := context.Background()
	userID, email, password, err := createTestUser(ctx, s, permissions.PermStartupOwner)
	require.NoError(t, err)

	token := loginAndGetToken(t, s, email, password)
	require.NotEmpty(t, token)

	// Clean up
	_, err = s.GetDB().Exec(ctx, "DELETE FROM users WHERE id = $1", userID)
	require.NoError(t, err)
}
