package tests

import (
	"testing"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/permissions"
	"github.com/stretchr/testify/assert"
)

type testStruct struct {
	Name          string `validate:"required"`
	Email         string `validate:"required,email"`
	Permissions   uint32 `validate:"valid_permissions"`
	WalletAddress string `validate:"wallet_address"`
	LinkedInURL   string `validate:"linkedin_url"`
}

func TestRequestValidator(t *testing.T) {
	validator := middleware.NewRequestValidator()

	tests := []struct {
		name         string
		input        testStruct
		expectError  bool
		errorField   string
		errorMessage string
	}{
		{
			name: "valid input",
			input: testStruct{
				Name:          "Test Name",
				Email:         "test@example.com",
				Permissions:   permissions.PermStartupOwner,
				WalletAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
				LinkedInURL:   "https://linkedin.com/in/test",
			},
			expectError: false,
		},
		{
			name: "invalid permissions",
			input: testStruct{
				Name:          "Test Name",
				Email:         "test@example.com",
				Permissions:   0,
				WalletAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
				LinkedInURL:   "https://linkedin.com/in/test",
			},
			expectError:  true,
			errorField:   "Permissions",
			errorMessage: "Permissions contains invalid permissions",
		},
		{
			name: "invalid email",
			input: testStruct{
				Name:          "Test Name",
				Email:         "invalid-email",
				Permissions:   permissions.PermStartupOwner,
				WalletAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
				LinkedInURL:   "https://linkedin.com/in/test",
			},
			expectError:  true,
			errorField:   "Email",
			errorMessage: "Email must be a valid email address",
		},
		{
			name: "invalid wallet address",
			input: testStruct{
				Name:          "Test Name",
				Email:         "test@example.com",
				Permissions:   permissions.PermStartupOwner,
				WalletAddress: "invalid",
				LinkedInURL:   "https://linkedin.com/in/test",
			},
			expectError:  true,
			errorField:   "WalletAddress",
			errorMessage: "WalletAddress must be a valid SUI wallet address",
		},
		{
			name: "invalid linkedin url",
			input: testStruct{
				Name:          "Test Name",
				Email:         "test@example.com",
				Permissions:   permissions.PermStartupOwner,
				WalletAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
				LinkedInURL:   "https://invalid.com",
			},
			expectError:  true,
			errorField:   "LinkedInURL",
			errorMessage: "LinkedInURL must be a valid LinkedIn URL",
		},
		{
			name: "missing required field",
			input: testStruct{
				Email:         "test@example.com",
				Permissions:   permissions.PermStartupOwner,
				WalletAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
				LinkedInURL:   "https://linkedin.com/in/test",
			},
			expectError:  true,
			errorField:   "Name",
			errorMessage: "Name is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(tt.input)
			if tt.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errorField)
				assert.Contains(t, err.Error(), tt.errorMessage)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
