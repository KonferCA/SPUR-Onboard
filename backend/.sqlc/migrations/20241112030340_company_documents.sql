-- +goose Up
-- +goose StatementBegin
CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_documents_company ON company_documents(company_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE company_documents;
-- +goose StatementEnd