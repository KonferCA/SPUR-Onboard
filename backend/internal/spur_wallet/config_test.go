package spur_wallet

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewSpurWalletConfig(t *testing.T) {
	tests := []struct {
		name         string
		envValue     string
		expectError  bool
		errorMsg     string
		expectedAddr string
	}{
		{
			name:         "valid wallet address",
			envValue:     "0x742d35Cc6935C90532C1cf5EfD6d93CaEB696323",
			expectError:  false,
			expectedAddr: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
		},
		{
			name:         "uppercase address gets normalized",
			envValue:     "0X742D35CC6935C90532C1CF5EFD6D93CAEB696323",
			expectError:  false,
			expectedAddr: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
		},
		{
			name:         "address without 0x prefix gets normalized",
			envValue:     "742d35Cc6935C90532C1cf5EfD6d93CaEB696323",
			expectError:  false,
			expectedAddr: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
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
			// clean up environment
			defer os.Unsetenv("SPUR_WALLET_ADDRESS")

			if tt.envValue != "" {
				os.Setenv("SPUR_WALLET_ADDRESS", tt.envValue)
			}

			config, err := NewSpurWalletConfig()

			if tt.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errorMsg)
				assert.Nil(t, config)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, config)
				assert.Equal(t, tt.expectedAddr, config.Address)
			}
		})
	}
}

func TestSpurWalletConfig_IsSpurWallet(t *testing.T) {
	spurAddress := "0x742d35cc6935c90532c1cf5efd6d93caeb696323"
	otherAddress := "0x690b9a9e9aa1c9db991c7721a92d351db4fac990"

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
			address:  "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
			expected: true,
		},
		{
			name:     "empty address (optional)",
			address:  "",
			expected: true,
		},
		{
			name:     "invalid format - no 0x prefix",
			address:  "742d35cc6935c90532c1cf5efd6d93caeb696323",
			expected: false,
		},
		{
			name:     "invalid format - too short",
			address:  "0x123",
			expected: false,
		},
		{
			name:     "invalid format - too long",
			address:  "0x742d35cc6935c90532c1cf5efd6d93caeb69632300",
			expected: false,
		},
		{
			name:     "invalid format - non-hex characters",
			address:  "0x742d35cc6935c90532c1cf5efd6d93caeb69632g",
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
