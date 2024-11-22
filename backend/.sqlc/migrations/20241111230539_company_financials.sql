-- +goose Up
-- +goose StatementBegin
CREATE TABLE company_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    financial_year INTEGER NOT NULL,
    revenue NUMERIC(15,2) NOT NULL,
    expenses NUMERIC(15,2) NOT NULL,
    profit NUMERIC(15,2) NOT NULL,
    sales NUMERIC(15,2) NOT NULL,
    amount_raised NUMERIC(15,2) NOT NULL,
    arr NUMERIC(15,2) NOT NULL,
    grants_received NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, financial_year)
);

CREATE INDEX idx_company_financials_company_id ON company_financials(company_id);
CREATE INDEX idx_company_financials_year ON company_financials(financial_year);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE company_financials;
-- +goose StatementEnd