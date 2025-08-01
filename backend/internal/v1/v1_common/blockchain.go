package v1_common

import (
	"net/http"

	"KonferCA/SPUR/internal/interfaces"

	"github.com/labstack/echo/v4"
)

/*
Handler struct for blockchain configuration endpoints.
*/
type BlockchainHandler struct {
	server interfaces.CoreServer
}

/*
NewBlockchainHandler creates a new blockchain configuration handler.
*/
func NewBlockchainHandler(s interfaces.CoreServer) *BlockchainHandler {
	return &BlockchainHandler{server: s}
}

/*
BlockchainConfigResponse represents the response body for blockchain configuration.
*/
type BlockchainConfigResponse struct {
	SpurCoinAddress       string `json:"spurcoin_address"`
	ProjectFundingAddress string `json:"project_funding_address"`
	BlockchainRpcUrl      string `json:"blockchain_rpc_url"`
	HasContractAddresses  bool   `json:"has_contract_addresses"`
}

/*
handleGetBlockchainConfig returns the current blockchain configuration.
This endpoint allows the frontend to get contract addresses and RPC URL.
No authentication required as this is public configuration data.
*/
func (h *BlockchainHandler) handleGetBlockchainConfig(c echo.Context) error {
	spurWallet := h.server.GetSpurWallet()

	response := BlockchainConfigResponse{
		SpurCoinAddress:       spurWallet.GetSpurCoinAddress(),
		ProjectFundingAddress: spurWallet.GetProjectFundingAddress(),
		BlockchainRpcUrl:      spurWallet.GetBlockchainRpcUrl(),
		HasContractAddresses:  spurWallet.HasContractAddresses(),
	}

	return c.JSON(http.StatusOK, response)
}

/*
SetupBlockchainRoutes registers blockchain configuration routes.
*/
func SetupBlockchainRoutes(e *echo.Group, s interfaces.CoreServer) {
	h := NewBlockchainHandler(s)

	// Public endpoint for blockchain configuration
	e.GET("/blockchain/config", h.handleGetBlockchainConfig)
}
