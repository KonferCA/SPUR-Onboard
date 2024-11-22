-- +goose Up
-- +goose StatementBegin
CREATE TABLE resource_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resource_requests_company ON resource_requests(company_id);
CREATE INDEX idx_resource_requests_status ON resource_requests(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE resource_requests;
-- +goose StatementEnd