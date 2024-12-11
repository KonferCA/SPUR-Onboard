-- +goose Up
-- +goose StatementBegin
ALTER TABLE companies
ADD COLUMN industry VARCHAR(100),
ADD COLUMN company_stage VARCHAR(50),
ADD COLUMN founded_date DATE;

-- Create indexes for common queries
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_company_stage ON companies(company_stage);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_companies_company_stage;
DROP INDEX idx_companies_industry;

ALTER TABLE companies 
DROP COLUMN industry,
DROP COLUMN company_stage,
DROP COLUMN founded_date;
-- +goose StatementEnd 