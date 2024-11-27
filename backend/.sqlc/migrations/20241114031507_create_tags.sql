-- +goose Up
-- +goose StatementBegin
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS tags CASCADE;
-- +goose StatementEnd