package spur_wallet

import (
	"fmt"
	"regexp"
	"strings"
)

// FormatWalletAddress formats a wallet address for display, showing first 8 and last 8 characters
func FormatWalletAddress(address string) string {
	normalized := NormalizeWalletAddress(address)
	if len(normalized) < 16 || !walletAddressPattern.MatchString(normalized) {
		return address // return original if invalid
	}
	return normalized[:8] + "..." + normalized[len(normalized)-8:]
}

// NormalizeWalletAddress normalizes a wallet address by converting to lowercase and ensuring 0x prefix
func NormalizeWalletAddress(address string) string {
	if address == "" {
		return ""
	}

	// Convert to lowercase
	normalized := strings.ToLower(address)

	// Ensure 0x prefix only if it's not already there AND the rest looks like hex
	if !strings.HasPrefix(normalized, "0x") {
		if regexp.MustCompile("^[0-9a-f]+$").MatchString(normalized) {
			normalized = "0x" + normalized
		}
	}

	return normalized
}

// transactionHashPattern matches transaction hash format (32 bytes = 64 hex characters)
var transactionHashPattern = regexp.MustCompile("^0x[0-9a-fA-F]{64}$")

// IsValidTransactionHash validates a transaction hash format (32 bytes = 64 hex characters)
func IsValidTransactionHash(hash string) bool {
	if hash == "" {
		return false
	}

	// Transaction hashes are 64 hex characters with 0x prefix (32 bytes)
	return transactionHashPattern.MatchString(hash)
}

// SpurWalletOperations provides common operations for SPUR wallet management
type SpurWalletOperations struct {
	config *SpurWalletConfig
}

// NewSpurWalletOperations creates a new instance of SPUR wallet operations
func NewSpurWalletOperations(config *SpurWalletConfig) *SpurWalletOperations {
	if config == nil {
		return nil
	}
	return &SpurWalletOperations{config: config}
}

// GetFormattedAddress returns a formatted version of the SPUR wallet address
func (s *SpurWalletOperations) GetFormattedAddress() string {
	return FormatWalletAddress(s.config.Address)
}

// ValidateTransferToSpur validates that a transaction is a valid transfer to the SPUR wallet
func (s *SpurWalletOperations) ValidateTransferToSpur(toAddress, txHash string) error {
	if !s.config.IsSpurWallet(toAddress) {
		return fmt.Errorf("transaction to address %s is not to SPUR wallet", FormatWalletAddress(toAddress))
	}

	if !IsValidTransactionHash(txHash) {
		return fmt.Errorf("invalid transaction hash format: %s", txHash)
	}

	return nil
}
