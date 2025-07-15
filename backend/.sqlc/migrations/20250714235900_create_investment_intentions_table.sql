-- +goose Up
-- +goose StatementBegin

-- create the investment_status enum
CREATE TYPE investment_status AS ENUM (
    'committed',            -- investor has committed but not paid
    'waiting_for_transfer', -- funding goal reached, waiting for payment
    'transferred_to_spur',  -- investor paid to SPUR wallet
    'transferred_to_company' -- SPUR paid to company wallet
);

-- create the investment_intentions table
CREATE TABLE IF NOT EXISTS investment_intentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    intended_amount DECIMAL(65,18) NOT NULL,
    status investment_status NOT NULL DEFAULT 'committed',
    transaction_hash VARCHAR, -- set when payment is made to SPUR wallet
    created_at BIGINT NOT NULL DEFAULT extract(epoch from now()),
    updated_at BIGINT NOT NULL DEFAULT extract(epoch from now()),
    UNIQUE(project_id, investor_id) -- one investment intention per investor per project
);

-- create indexes for performance
CREATE INDEX idx_investment_intentions_project ON investment_intentions(project_id);
CREATE INDEX idx_investment_intentions_investor ON investment_intentions(investor_id);
CREATE INDEX idx_investment_intentions_status ON investment_intentions(status);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- drop the table and its indexes (indexes are dropped automatically with the table)
DROP TABLE IF EXISTS investment_intentions;

-- drop the enum type
DROP TYPE IF EXISTS investment_status;

-- +goose StatementEnd 