-- +goose Up
-- +goose StatementBegin
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_email ON employees(email);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE employees;
-- +goose StatementEnd
