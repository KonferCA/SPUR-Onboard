package spur_wallet

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFormatWalletAddress(t *testing.T) {
	tests := []struct {
		name     string
		address  string
		expected string
	}{
		{
			name:     "normal wallet address",
			address:  "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
			expected: "0x742d35...eb696323",
		},
		{
			name:     "short address",
			address:  "0x123",
			expected: "0x123",
		},
		{
			name:     "empty address",
			address:  "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatWalletAddress(tt.address)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNormalizeWalletAddress(t *testing.T) {
	tests := []struct {
		name     string
		address  string
		expected string
	}{
		{
			name:     "uppercase address with 0x prefix",
			address:  "0x742D35CC6935C90532C1CF5EFD6D93CAEB696323",
			expected: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
		},
		{
			name:     "address without 0x prefix",
			address:  "742D35CC6935C90532C1CF5EFD6D93CAEB696323",
			expected: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
		},
		{
			name:     "empty address",
			address:  "",
			expected: "",
		},
		{
			name:     "already normalized",
			address:  "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
			expected: "0x742d35cc6935c90532c1cf5efd6d93caeb696323",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeWalletAddress(tt.address)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestIsValidTransactionHash(t *testing.T) {
	tests := []struct {
		name     string
		hash     string
		expected bool
	}{
		{
			name:     "valid transaction hash",
			hash:     "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			expected: true,
		},
		{
			name:     "empty hash",
			hash:     "",
			expected: false,
		},
		{
			name:     "invalid format - no 0x prefix",
			hash:     "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			expected: false,
		},
		{
			name:     "invalid format - too short",
			hash:     "0x123",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidTransactionHash(tt.hash)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestSpurWalletOperations(t *testing.T) {
	spurAddress := "0x742d35cc6935c90532c1cf5efd6d93caeb696323"
	config := &SpurWalletConfig{Address: spurAddress}
	ops := NewSpurWalletOperations(config)

	t.Run("GetFormattedAddress", func(t *testing.T) {
		formatted := ops.GetFormattedAddress()
		assert.Equal(t, "0x742d35...eb696323", formatted)
	})

	t.Run("ValidateTransferToSpur - valid", func(t *testing.T) {
		txHash := "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
		err := ops.ValidateTransferToSpur(spurAddress, txHash)
		assert.NoError(t, err)
	})

	t.Run("ValidateTransferToSpur - wrong address", func(t *testing.T) {
		wrongAddress := "0x690b9a9e9aa1c9db991c7721a92d351db4fac990"
		txHash := "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
		err := ops.ValidateTransferToSpur(wrongAddress, txHash)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "is not to SPUR wallet")
	})

	t.Run("ValidateTransferToSpur - invalid tx hash", func(t *testing.T) {
		invalidTxHash := "invalid_hash"
		err := ops.ValidateTransferToSpur(spurAddress, invalidTxHash)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid transaction hash format")
	})
}
