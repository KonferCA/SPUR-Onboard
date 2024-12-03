-- +goose Up
-- +goose StatementBegin

-- by default, goose runs in transactions

ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

ALTER TABLE users DROP COLUMN email_verified;

-- +goose StatementEnd
