package tests

import (
	"os"
	"testing"

	"KonferCA/SPUR/internal/spur_wallet"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSpurCoinConfiguration(t *testing.T) {
	// Save original env vars
	originalWallet := os.Getenv("SPUR_WALLET_ADDRESS")
	originalSpurCoin := os.Getenv("SPURCOIN_CONTRACT_ADDRESS")
	originalProjectFunding := os.Getenv("PROJECT_FUNDING_CONTRACT_ADDRESS")
	originalRpc := os.Getenv("BLOCKCHAIN_RPC_URL")

	// Cleanup function
	defer func() {
		os.Setenv("SPUR_WALLET_ADDRESS", originalWallet)
		os.Setenv("SPURCOIN_CONTRACT_ADDRESS", originalSpurCoin)
		os.Setenv("PROJECT_FUNDING_CONTRACT_ADDRESS", originalProjectFunding)
		os.Setenv("BLOCKCHAIN_RPC_URL", originalRpc)
	}()

	t.Run("should load minimal configuration with only wallet address", func(t *testing.T) {
		// Set minimal required env
		os.Setenv("SPUR_WALLET_ADDRESS", "0x742d35cc6935c90532c1cf5efd6d93caeb696323")
		os.Unsetenv("SPURCOIN_CONTRACT_ADDRESS")
		os.Unsetenv("PROJECT_FUNDING_CONTRACT_ADDRESS")
		os.Unsetenv("BLOCKCHAIN_RPC_URL")

		config, err := spur_wallet.NewSpurWalletConfig()
		require.NoError(t, err)

		assert.Equal(t, "0x742d35cc6935c90532c1cf5efd6d93caeb696323", config.GetAddress())
		assert.Equal(t, "", config.GetSpurCoinAddress())
		assert.Equal(t, "", config.GetProjectFundingAddress())
		assert.Equal(t, "http://127.0.0.1:8545", config.GetBlockchainRpcUrl()) // Default
		assert.False(t, config.HasContractAddresses())
	})

	t.Run("should load full blockchain configuration", func(t *testing.T) {
		// Set all env vars
		os.Setenv("SPUR_WALLET_ADDRESS", "0x742d35cc6935c90532c1cf5efd6d93caeb696323")
		os.Setenv("SPURCOIN_CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
		os.Setenv("PROJECT_FUNDING_CONTRACT_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
		os.Setenv("BLOCKCHAIN_RPC_URL", "http://localhost:8545")

		config, err := spur_wallet.NewSpurWalletConfig()
		require.NoError(t, err)

		assert.Equal(t, "0x742d35cc6935c90532c1cf5efd6d93caeb696323", config.GetAddress())
		assert.Equal(t, "0x5fbdb2315678afecb367f032d93f642f64180aa3", config.GetSpurCoinAddress())
		assert.Equal(t, "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", config.GetProjectFundingAddress())
		assert.Equal(t, "http://localhost:8545", config.GetBlockchainRpcUrl())
		assert.True(t, config.HasContractAddresses())
	})

	t.Run("should validate contract address formats", func(t *testing.T) {
		testCases := []struct {
			name            string
			spurCoinAddr    string
			projectFundAddr string
			expectError     bool
		}{
			{
				name:            "valid addresses",
				spurCoinAddr:    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
				projectFundAddr: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
				expectError:     false,
			},
			{
				name:            "invalid spurcoin address",
				spurCoinAddr:    "invalid_address",
				projectFundAddr: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
				expectError:     true,
			},
			{
				name:            "invalid project funding address",
				spurCoinAddr:    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
				projectFundAddr: "not_an_address",
				expectError:     true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				os.Setenv("SPUR_WALLET_ADDRESS", "0x742d35cc6935c90532c1cf5efd6d93caeb696323")
				os.Setenv("SPURCOIN_CONTRACT_ADDRESS", tc.spurCoinAddr)
				os.Setenv("PROJECT_FUNDING_CONTRACT_ADDRESS", tc.projectFundAddr)

				_, err := spur_wallet.NewSpurWalletConfig()

				if tc.expectError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("should normalize contract addresses", func(t *testing.T) {
		// Test with uppercase addresses
		os.Setenv("SPUR_WALLET_ADDRESS", "0x742d35cc6935c90532c1cf5efd6d93caeb696323")
		os.Setenv("SPURCOIN_CONTRACT_ADDRESS", "0X5FBDB2315678AFECB367F032D93F642F64180AA3")
		os.Setenv("PROJECT_FUNDING_CONTRACT_ADDRESS", "0XE7F1725E7734CE288F8367E1BB143E90BB3F0512")

		config, err := spur_wallet.NewSpurWalletConfig()
		require.NoError(t, err)

		// Should be normalized to lowercase
		assert.Equal(t, "0x5fbdb2315678afecb367f032d93f642f64180aa3", config.GetSpurCoinAddress())
		assert.Equal(t, "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", config.GetProjectFundingAddress())
	})
}
