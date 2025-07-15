package spur_wallet

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewSpurWalletConfig(t *testing.T) {
	tests := []struct {
		name        string
		envValue    string
		expectError bool
		errorMsg    string
	}{
		{
			name:        "valid wallet address",
			envValue:    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			expectError: false,
		},
		{
			name:        "missing environment variable",
			envValue:    "",
			expectError: true,
			errorMsg:    "SPUR_WALLET_ADDRESS environment variable is required",
		},
		{
			name:        "invalid wallet address format",
			envValue:    "invalid_address",
			expectError: true,
			errorMsg:    "invalid SPUR wallet address format",
		},
		{
			name:        "wallet address too short",
			envValue:    "0x123",
			expectError: true,
			errorMsg:    "invalid SPUR wallet address format",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set up environment
			if tt.envValue != "" {
				os.Setenv("SPUR_WALLET_ADDRESS", tt.envValue)
			} else {
				os.Unsetenv("SPUR_WALLET_ADDRESS")
			}
			defer os.Unsetenv("SPUR_WALLET_ADDRESS")

			config, err := NewSpurWalletConfig()

			if tt.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errorMsg)
				assert.Nil(t, config)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, config)
				assert.Equal(t, tt.envValue, config.GetAddress())
			}
		})
	}
}

func TestSpurWalletConfig_IsSpurWallet(t *testing.T) {
	spurAddress := "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
	otherAddress := "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"

	config := &SpurWalletConfig{Address: spurAddress}

	assert.True(t, config.IsSpurWallet(spurAddress))
	assert.False(t, config.IsSpurWallet(otherAddress))
	assert.False(t, config.IsSpurWallet(""))
}

func TestValidateWalletAddress(t *testing.T) {
	tests := []struct {
		name     string
		address  string
		expected bool
	}{
		{
			name:     "valid wallet address",
			address:  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			expected: true,
		},
		{
			name:     "empty address (optional)",
			address:  "",
			expected: true,
		},
		{
			name:     "invalid format - no 0x prefix",
			address:  "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			expected: false,
		},
		{
			name:     "invalid format - too short",
			address:  "0x123",
			expected: false,
		},
		{
			name:     "invalid format - too long",
			address:  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00",
			expected: false,
		},
		{
			name:     "invalid format - non-hex characters",
			address:  "0x1234567890abcdefg234567890abcdef1234567890abcdef1234567890abcdef",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateWalletAddress(tt.address)
			assert.Equal(t, tt.expected, result)
		})
	}
}
