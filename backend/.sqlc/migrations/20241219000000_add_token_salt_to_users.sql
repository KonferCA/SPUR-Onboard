-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN token_salt BYTEA;

-- backfill existing users with random salt
UPDATE users SET token_salt = gen_random_bytes(32);

-- make token_salt non-nullable
ALTER TABLE users ALTER COLUMN token_salt SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN token_salt;

-- +goose StatementEnd 