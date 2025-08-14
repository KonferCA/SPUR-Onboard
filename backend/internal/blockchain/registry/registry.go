package registry

import (
	"context"
	"fmt"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Client struct{ rpcURL string }

func New(rpcURL string) *Client { return &Client{rpcURL: rpcURL} }

// ReadValues fetches platformWallet, spurCoin, projectFunding using the generated binding.
func (c *Client) ReadValues(ctx context.Context, registryAddress string) (platform string, spurcoin string, funding string, err error) {
	cli, err := ethclient.DialContext(ctx, c.rpcURL)
	if err != nil {
		return "", "", "", fmt.Errorf("dial eth client: %w", err)
	}
	defer cli.Close()

	addr := common.HexToAddress(registryAddress)
	bound, err := NewSpurRegistry(addr, cli)
	if err != nil {
		return "", "", "", fmt.Errorf("bind registry: %w", err)
	}
	call := &bind.CallOpts{Context: ctx}

	p, err := bound.PlatformWallet(call)
	if err != nil {
		return "", "", "", fmt.Errorf("platformWallet: %w", err)
	}
	s, err := bound.SpurCoin(call)
	if err != nil {
		return "", "", "", fmt.Errorf("spurCoin: %w", err)
	}
	f, err := bound.ProjectFunding(call)
	if err != nil {
		return "", "", "", fmt.Errorf("projectFunding: %w", err)
	}
	return p.Hex(), s.Hex(), f.Hex(), nil
}
