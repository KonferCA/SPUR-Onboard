-- +goose Up
-- +goose StatementBegin
BEGIN;

ALTER TABLE users ADD COLUMN role_enum user_role NOT NULL;

UPDATE users
SET role_enum = role::user_role;

ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_enum TO role;

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

ALTER TABLE users ADD COLUMN role_varchar VARCHAR(50) NOT NULL;

UPDATE users
SET  role_varchar = role::text;

ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_varchar TO role;

COMMIT;
-- +goose StatementEnd
