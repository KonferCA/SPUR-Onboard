package tests

import (
	"KonferCA/SPUR/internal/middleware"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type testStruct struct {
	UserRole      string `validate:"required,valid_user_role"`
	NonAdminRole  string `validate:"required,non_admin_role"`
	S3URL         string `validate:"required,s3_url"`
	WalletAddress string `validate:"wallet_address"`
	LinkedInURL   string `validate:"required,linkedin_url"`
	ProjectStatus string `validate:"required,project_status"`
	Email         string `validate:"required,email"`
	Bio           string `validate:"max=500"`
	Password      string `validate:"required,min=8"`
}

func TestRequestValidator(t *testing.T) {
	validator := middleware.NewRequestValidator()
	assert.NotNil(t, validator)

	os.Setenv("AWS_S3_BUCKET", "test-bucket")
	defer os.Unsetenv("AWS_S3_BUCKET")

	tests := []struct {
		name          string
		input         testStruct
		expectedError bool
		errorMessage  string
	}{
		{
			name: "valid input - all fields",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				WalletAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: false,
		},
		{
			name: "invalid user role",
			input: testStruct{
				UserRole:      "invalid_role",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "UserRole must be a valid user role",
		},
		{
			name: "admin role not allowed",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "admin",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "NonAdminRole cannot be an admin role",
		},
		{
			name: "invalid S3 URL",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://wrong-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "S3URL must be a valid S3 URL",
		},
		{
			name: "invalid wallet address",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				WalletAddress: "invalid-address",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "WalletAddress must be a valid SUI wallet address",
		},
		{
			name: "invalid LinkedIn URL",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "invalid-url",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "LinkedInURL must be a valid LinkedIn URL",
		},
		{
			name: "invalid project status",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "invalid_status",
				Email:         "test@example.com",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "ProjectStatus must be a valid project status",
		},
		{
			name: "invalid email",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "invalid-email",
				Password:      "password123",
			},
			expectedError: true,
			errorMessage:  "Email must be a valid email address",
		},
		{
			name: "password too short",
			input: testStruct{
				UserRole:      "startup_owner",
				NonAdminRole:  "investor",
				S3URL:         "https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg",
				LinkedInURL:   "https://linkedin.com/in/test",
				ProjectStatus: "draft",
				Email:         "test@example.com",
				Password:      "short",
			},
			expectedError: true,
			errorMessage:  "Password must be at least 8 characters long",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := validator.Validate(tc.input)
			if tc.expectedError {
				assert.Error(t, err)
				httpErr, ok := err.(*echo.HTTPError)
				assert.True(t, ok)
				assert.Contains(t, httpErr.Message, tc.errorMessage)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
