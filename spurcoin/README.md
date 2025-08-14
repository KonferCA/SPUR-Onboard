# SPUR Smart Contracts (EVM)

This directory has the Hardhat project for all SPUR-related smart contracts on the EVM.

## Core Contracts

-   `SpurCoin.sol`: An OpenZeppelin ERC20 token and native currency for Onboard. It includes an `Ownable` pattern, allowing the deployer to mint new tokens.
-   `ProjectFunding.sol`: Manages the project funding lifecycle. It allows for the creation of projects, depositing `SpurCoin` into them, and withdrawing funds to a designated project recipient.
-   `SpurRegistry.sol`: The on-chain source of truth for critical platform addresses. This contract acts as a discovery mechanism for other services, mainly the backend, to find the addresses for `SpurCoin`, `ProjectFunding`, and the main `platformWallet`.

---

## Development Workflow

### 1. Installation

Install all required dependencies. From inside the `spurcoin/` directory:

```shell
pnpm install
```

### 2. Compiling

Compile the smart contracts, which also generates TypeChain bindings for TypeScript and contract artifacts (ABIs) in the `artifacts/` directory.

```shell
pnpm run compile
```

### 3. Testing

Run the full test suite for the contracts.

```shell
pnpm run test
```

---

## Local Development and Deployment

### Running a Local Node

To start a local development blockchain, use the Hardhat node. This provides a fresh, local EVM environment with pre-funded accounts.

```shell
pnpm run node
```

This will start a JSON-RPC server at `http://127.0.0.1:8545`.

### Deploying Locally

With the local node running, deploy the contracts to it in a separate terminal:

```shell
pnpm run deploy:local
```

This script will:
1.  Deploy `SpurCoin`, `ProjectFunding`, and `SpurRegistry`.
2.  Initialize the `SpurRegistry` with the addresses of the other deployed contracts.
3.  Print the environment variables (`BLOCKCHAIN_RPC_URL` and `SPUR_REGISTRY_ADDRESS`) that the backend needs.
4.  Write a deployment manifest to `spurcoin/deployments/local.json`.

---

## Integration with Backend

The backend relies on the `SpurRegistry` contract to function. At startup, the backend:
1.  Connects to the blockchain via the `BLOCKCHAIN_RPC_URL` environment variable.
2.  Reads the `SpurCoin` and `ProjectFunding` contract addresses from the `SpurRegistry` contract located at `SPUR_REGISTRY_ADDRESS`.

```shell
# From root
pnpm run stack:up
```

This script automates the entire local setup:
1.  Starts the Hardhat node.
2.  Deploys the contracts.
3.  Reads the `SpurRegistry` address from the deployment manifest.
4.  Starts the backend with all environment variables.
5.  Starts the frontend dev server.