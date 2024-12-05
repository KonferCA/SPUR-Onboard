-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS verify_email_tokens (
    -- id column will be used in the standard jwt id claims.
    -- which can be used to identify/select the record in the db.
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS verify_email_tokens;
-- +goose StatementEnd
