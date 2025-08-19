## 1. Overview

This document outlines the technical design for the funding system on the SPUR platform. The model is a two-stage, SPUR-mediated system. It is designed for simplicity, security, and auditability, prioritizing a clear and controlled flow of funds.

- **Stage 1 (Intention):** Investors declare their intent to invest in a project without committing funds. This state is tracked in the SPUR backend.
- **Stage 2 (On-Chain Transfer & SPUR Payout):** Once a project's funding goal is met, investors are prompted to transfer funds to a central SPUR platform wallet. SPUR verifies these transfers and then manually aggregates and forwards the total amount to the startup's designated wallet.

## 2. System Components

### A. Backend

The backend is the primary source of truth for the funding workflow state. It stores and manages:

- **Investment Intentions:** Records of which investor intends to invest how much in which project.
- **Funding Goal Progress:** Aggregates intentions for each project to track progress towards its goal.
- **Investor/Investment Status:** Tracks the state of each investment (e.g., `INTENTION_DECLARED`, `AWAITING_TRANSFER`, `FUNDS_RECEIVED_BY_SPUR`, `PAID_TO_COMPANY`).
- **Transaction Hashes:** Stores the on-chain transaction hashes of investor transfers for auditing.

### B. Smart Contracts (EVM)

The contracts provide the on-chain infrastructure for value transfer and configuration.

- **`SpurRegistry.sol`**: The on-chain address book.
  - Provides a single, reliable source of truth for critical platform addresses.
  - The backend reads from this contract at startup (and periodically) to get the addresses of the platform wallet and the `SpurCoin` token.
- **`SpurCoin.sol`**: The official ERC20 token for the platform.
  - The asset used for all investment funding.
  - Investors transfer this token to the SPUR platform wallet. The backend validates these `Transfer` events on-chain.

## 3. Funding Flow

1. **Intention Declaration**: An investor connects their wallet to the platform and submits an "investment intention" for a specific project with amount `X`. This action calls a backend API endpoint, creating an off-chain record. No transaction occurs.
2. **Goal Reached**: The backend continuously aggregates intentions. When a project's funding goal is met, the system flags it as ready for funding.
3. **Investor Notification**: Investors who made intentions for the project are notified (e.g., via email, in-app notification) that it's time to transfer funds.
4. **Fund Transfer**: The investor returns to the project page and clicks a "Fund Now" button. This action opens their connected wallet with a pre-filled transaction to transfer `X` `SpurCoin` to the SPUR platform wallet. The frontend gets the platform wallet address from the backend's `/api/v1/blockchain/config` endpoint.
5. **Transaction Validation**: After the investor approves the transaction, the frontend submits the transaction hash to the backend via a `/api/v1/transactions/validate` endpoint. The backend uses an RPC connection to:
   - Verify the transaction was successful.
   - Confirm the `from` address belongs to the investor.
   - Confirm the `to` address is the SPUR platform wallet.
   - Confirm the `token` and `amount` match the investor's intention.
     Upon successful validation, the backend updates the investment status to `FUNDS_RECEIVED_BY_SPUR`.
6. **Fund Aggregation**: SPUR administrators monitor the funding status. Once all (or a sufficient number of) investors have successfully transferred their funds, the admin prepares for the final payout.
7. **Company Payout**: A SPUR admin initiates the final payout, transferring the total aggregated `SpurCoin` amount from the platform wallet to the startup's designated wallet. This is done manually.
8. **Final Status Update**: The backend records the payout transaction and updates the project's status to `FUNDED` and the individual investment statuses to `PAID_TO_COMPANY`.

## 4. State Management

The investment lifecycle is tracked with the following statuses, stored in the backend database:


| Status                   | Description                                                            | Trigger                                                   |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `INTENTION_DECLARED`     | Investor has declared an intent to invest.                             | Investor submits intention form.                          |
| `AWAITING_TRANSFER`      | Project goal has been met; investor has been notified to send funds.   | Backend cron job or admin action after goal is met.       |
| `FUNDS_RECEIVED_BY_SPUR` | Investor's transaction has been validated on-chain.                    | Successful validation of transaction hash by the backend. |
| `PAID_TO_COMPANY`        | SPUR has successfully transferred the funds to the startup.            | SPUR admin confirms payout.                               |
| `CANCELED` / `FLAKED`    | Investor failed to transfer funds in time or canceled their intention. | Timeout or manual action.                                 |
