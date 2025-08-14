package spur_wallet

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"KonferCA/SPUR/internal/blockchain/registry"

	"github.com/rs/zerolog/log"
)

// walletAddressPattern matches Ethereum address format (20 bytes = 40 hex characters)
var walletAddressPattern = regexp.MustCompile("^0x[0-9a-fA-F]{40}$")

// SpurWalletConfig holds configuration for SPUR wallet operations and blockchain contracts
type SpurWalletConfig struct {
	// Chain config
	BlockchainRpcUrl string // Blockchain RPC endpoint URL

	// Registry anchor
	RegistryAddress string

	// Cached values pulled from registry
	Address               string // Main SPUR platform wallet address
	SpurCoinAddress       string // SpurCoin ERC20 token contract address
	ProjectFundingAddress string // ProjectFunding contract address

	// cache controls
	mu          sync.RWMutex
	lastRefresh time.Time
	ttl         time.Duration
}

// NewSpurWalletConfig creates a new SPUR wallet configuration from environment variables
func NewSpurWalletConfig() (*SpurWalletConfig, error) {
	blockchainRpcUrl := os.Getenv("BLOCKCHAIN_RPC_URL")
	if blockchainRpcUrl == "" {
		blockchainRpcUrl = "http://127.0.0.1:8545" // Default to dev
	}
	registryAddress := os.Getenv("SPUR_REGISTRY_ADDRESS")

	cfg := &SpurWalletConfig{
		BlockchainRpcUrl: blockchainRpcUrl,
		RegistryAddress:  NormalizeWalletAddress(registryAddress),
		ttl:              30 * time.Second,
	}

	// Initial populate: if registry configured, attempt to refresh from chain.
	if cfg.RegistryAddress == "" {
		return nil, fmt.Errorf("SPUR_REGISTRY_ADDRESS environment variable is required")
	}
	if !walletAddressPattern.MatchString(cfg.RegistryAddress) {
		return nil, fmt.Errorf("invalid SPUR_REGISTRY_ADDRESS format: %s", registryAddress)
	}
	if err := cfg.refreshFromRegistry(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to read addresses from registry: %w", err)
	}
	// Validate that required addresses were populated
	if !walletAddressPattern.MatchString(cfg.Address) || isZeroAddress(cfg.Address) {
		return nil, fmt.Errorf("invalid platform wallet address from registry: %s", cfg.Address)
	}
	if !walletAddressPattern.MatchString(cfg.SpurCoinAddress) || isZeroAddress(cfg.SpurCoinAddress) {
		return nil, fmt.Errorf("invalid SpurCoin address from registry: %s", cfg.SpurCoinAddress)
	}
	if !walletAddressPattern.MatchString(cfg.ProjectFundingAddress) || isZeroAddress(cfg.ProjectFundingAddress) {
		return nil, fmt.Errorf("invalid ProjectFunding address from registry: %s", cfg.ProjectFundingAddress)
	}

	log.Info().
		Str("platform_wallet", cfg.Address).
		Str("spurcoin_address", cfg.SpurCoinAddress).
		Str("project_funding_address", cfg.ProjectFundingAddress).
		Str("rpc_url", cfg.BlockchainRpcUrl).
		Str("registry_address", cfg.RegistryAddress).
		Msg("SPUR wallet and blockchain configuration initialized")

	return cfg, nil
}

// GetAddress returns the configured SPUR wallet address
func (c *SpurWalletConfig) GetAddress() string {
	c.ensureFresh()
	return c.Address
}

// GetSpurCoinAddress returns the configured SpurCoin contract address
func (c *SpurWalletConfig) GetSpurCoinAddress() string {
	c.ensureFresh()
	return c.SpurCoinAddress
}

// GetProjectFundingAddress returns the configured ProjectFunding contract address
func (c *SpurWalletConfig) GetProjectFundingAddress() string {
	c.ensureFresh()
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
	c.ensureFresh()
	return c.SpurCoinAddress != "" && c.ProjectFundingAddress != ""
}

// ValidateWalletAddress validates a wallet address using the same pattern as middleware
func ValidateWalletAddress(address string) bool {
	if address == "" {
		return true // optional field
	}
	return walletAddressPattern.MatchString(address)
}

func isZeroAddress(addr string) bool {
	return strings.ToLower(NormalizeWalletAddress(addr)) == "0x0000000000000000000000000000000000000000"
}

// refreshFromRegistry populates cached addresses from the on-chain registry with TTL
func (c *SpurWalletConfig) refreshFromRegistry(ctx context.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Skip if recently refreshed
	if time.Since(c.lastRefresh) < c.ttl {
		return nil
	}

	if c.RegistryAddress == "" {
		return fmt.Errorf("registry address not configured")
	}
	// Lazy import to avoid hard dependency here; we can call a thin internal client
	// For now, use a local helper implemented in this package to avoid adding new files
	client := registry.New(c.BlockchainRpcUrl)
	platform, spur, funding, err := client.ReadValues(ctx, c.RegistryAddress)
	if err != nil {
		return err
	}
	c.Address = platform
	c.SpurCoinAddress = spur
	c.ProjectFundingAddress = funding
	c.lastRefresh = time.Now()
	return nil
}

func (c *SpurWalletConfig) ensureFresh() {
	if c.RegistryAddress == "" {
		return
	}
	c.mu.RLock()
	expired := time.Since(c.lastRefresh) >= c.ttl
	c.mu.RUnlock()
	if expired {
		// Best effort refresh; log errors
		if err := c.refreshFromRegistry(context.Background()); err != nil {
			log.Error().Err(err).Msg("failed to refresh registry values")
		}
	}
}
