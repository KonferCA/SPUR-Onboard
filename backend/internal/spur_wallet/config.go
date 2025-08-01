package spur_wallet

import (
	"fmt"
	"os"
	"regexp"

	"github.com/rs/zerolog/log"
)

// walletAddressPattern matches Ethereum address format (20 bytes = 40 hex characters)
var walletAddressPattern = regexp.MustCompile("^0x[0-9a-fA-F]{40}$")

// SpurWalletConfig holds configuration for SPUR wallet operations and blockchain contracts
type SpurWalletConfig struct {
	Address               string // Main SPUR platform wallet address
	SpurCoinAddress       string // SpurCoin ERC20 token contract address
	ProjectFundingAddress string // ProjectFunding contract address
	BlockchainRpcUrl      string // Blockchain RPC endpoint URL
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

	// Load contract addresses - these are optional for development flexibility
	spurCoinAddress := os.Getenv("SPURCOIN_CONTRACT_ADDRESS")
	if spurCoinAddress != "" {
		spurCoinAddress = NormalizeWalletAddress(spurCoinAddress)
		if !walletAddressPattern.MatchString(spurCoinAddress) {
			return nil, fmt.Errorf("invalid SpurCoin contract address format: %s", spurCoinAddress)
		}
	}

	projectFundingAddress := os.Getenv("PROJECT_FUNDING_CONTRACT_ADDRESS")
	if projectFundingAddress != "" {
		projectFundingAddress = NormalizeWalletAddress(projectFundingAddress)
		if !walletAddressPattern.MatchString(projectFundingAddress) {
			return nil, fmt.Errorf("invalid ProjectFunding contract address format: %s", projectFundingAddress)
		}
	}

	blockchainRpcUrl := os.Getenv("BLOCKCHAIN_RPC_URL")
	if blockchainRpcUrl == "" {
		blockchainRpcUrl = "http://127.0.0.1:8545" // Default to local development
	}

	log.Info().
		Str("wallet_address", normalizedAddress).
		Str("spurcoin_address", spurCoinAddress).
		Str("project_funding_address", projectFundingAddress).
		Str("rpc_url", blockchainRpcUrl).
		Msg("SPUR wallet and blockchain configuration loaded")

	return &SpurWalletConfig{
		Address:               normalizedAddress,
		SpurCoinAddress:       spurCoinAddress,
		ProjectFundingAddress: projectFundingAddress,
		BlockchainRpcUrl:      blockchainRpcUrl,
	}, nil
}

// GetAddress returns the configured SPUR wallet address
func (c *SpurWalletConfig) GetAddress() string {
	return c.Address
}

// GetSpurCoinAddress returns the configured SpurCoin contract address
func (c *SpurWalletConfig) GetSpurCoinAddress() string {
	return c.SpurCoinAddress
}

// GetProjectFundingAddress returns the configured ProjectFunding contract address
func (c *SpurWalletConfig) GetProjectFundingAddress() string {
	return c.ProjectFundingAddress
}

// GetBlockchainRpcUrl returns the configured blockchain RPC URL
func (c *SpurWalletConfig) GetBlockchainRpcUrl() string {
	return c.BlockchainRpcUrl
}

// IsSpurWallet checks if the given address is the SPUR wallet address
func (c *SpurWalletConfig) IsSpurWallet(address string) bool {
	normalizedAddress := NormalizeWalletAddress(address)
	return c.Address == normalizedAddress
}

// HasContractAddresses returns true if both contract addresses are configured
func (c *SpurWalletConfig) HasContractAddresses() bool {
	return c.SpurCoinAddress != "" && c.ProjectFundingAddress != ""
}

// ValidateWalletAddress validates a wallet address using the same pattern as middleware
func ValidateWalletAddress(address string) bool {
	if address == "" {
		return true // optional field
	}
	return walletAddressPattern.MatchString(address)
}
