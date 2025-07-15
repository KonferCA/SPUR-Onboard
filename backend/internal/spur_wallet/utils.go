package spur_wallet

import (
	"fmt"
	"strings"
)

// FormatWalletAddress formats a wallet address for display, showing first 8 and last 8 characters
func FormatWalletAddress(address string) string {
	if len(address) < 16 {
		return address
	}
	return fmt.Sprintf("%s...%s", address[:8], address[len(address)-8:])
}

// NormalizeWalletAddress normalizes a wallet address by converting to lowercase and ensuring 0x prefix
func NormalizeWalletAddress(address string) string {
	if address == "" {
		return ""
	}

	// Convert to lowercase
	normalized := strings.ToLower(address)

	// Ensure 0x prefix
	if !strings.HasPrefix(normalized, "0x") {
		normalized = "0x" + normalized
	}

	return normalized
}

// IsValidTransactionHash validates a transaction hash format (similar to wallet address but may have different length)
func IsValidTransactionHash(hash string) bool {
	if hash == "" {
		return false
	}

	// Transaction hashes are typically 64 hex characters with 0x prefix
	return walletAddressPattern.MatchString(hash)
}

// SpurWalletOperations provides common operations for SPUR wallet management
type SpurWalletOperations struct {
	config *SpurWalletConfig
}

// NewSpurWalletOperations creates a new instance of SPUR wallet operations
func NewSpurWalletOperations(config *SpurWalletConfig) *SpurWalletOperations {
	return &SpurWalletOperations{config: config}
}

// GetFormattedAddress returns a formatted version of the SPUR wallet address
func (s *SpurWalletOperations) GetFormattedAddress() string {
	return FormatWalletAddress(s.config.Address)
}

// ValidateTransferToSpur validates that a transaction is a valid transfer to the SPUR wallet
func (s *SpurWalletOperations) ValidateTransferToSpur(toAddress, txHash string) error {
	if !s.config.IsSpurWallet(toAddress) {
		return fmt.Errorf("transaction to address %s is not to SPUR wallet %s", toAddress, s.config.Address)
	}

	if !IsValidTransactionHash(txHash) {
		return fmt.Errorf("invalid transaction hash format: %s", txHash)
	}

	return nil
}
