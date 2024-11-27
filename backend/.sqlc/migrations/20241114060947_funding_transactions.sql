-- +goose Up
-- +goose StatementBegin
CREATE TABLE funding_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL,
    from_wallet_address VARCHAR(255) NOT NULL,
    to_wallet_address VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funding_transactions_project ON funding_transactions(project_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS funding_transactions;
-- +goose StatementEnd