-- +goose Up
-- +goose StatementBegin
BEGIN;

CREATE TYPE user_role AS ENUM ('admin', 'startup_owner', 'investor');

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

DROP TYPE user_role;

COMMIT;
-- +goose StatementEnd
