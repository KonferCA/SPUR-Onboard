package spur_wallet

import (
	"fmt"
	"os"
	"regexp"

	"github.com/rs/zerolog/log"
)

// walletAddressPattern matches Ethereum address format (20 bytes = 40 hex characters)
var walletAddressPattern = regexp.MustCompile("^0x[0-9a-fA-F]{40}$")

// SpurWalletConfig holds configuration for SPUR wallet operations
type SpurWalletConfig struct {
	Address string
}

// NewSpurWalletConfig creates a new SPUR wallet configuration from environment variables
func NewSpurWalletConfig() (*SpurWalletConfig, error) {
	address := os.Getenv("SPUR_WALLET_ADDRESS")
	if address == "" {
		return nil, fmt.Errorf("SPUR_WALLET_ADDRESS environment variable is required")
	}

	// normalize the address before validation and storage
	normalizedAddress := NormalizeWalletAddress(address)

	if !walletAddressPattern.MatchString(normalizedAddress) {
		return nil, fmt.Errorf("invalid SPUR wallet address format: %s", address)
	}

	log.Info().Str("address", normalizedAddress).Msg("SPUR wallet configured")

	return &SpurWalletConfig{
		Address: normalizedAddress,
	}, nil
}

// GetAddress returns the configured SPUR wallet address
func (c *SpurWalletConfig) GetAddress() string {
	return c.Address
}

// IsSpurWallet checks if the given address is the SPUR wallet address
func (c *SpurWalletConfig) IsSpurWallet(address string) bool {
	return c.Address == address
}

// ValidateWalletAddress validates a wallet address using the same pattern as middleware
func ValidateWalletAddress(address string) bool {
	if address == "" {
		return true // optional field
	}
	return walletAddressPattern.MatchString(address)
}
