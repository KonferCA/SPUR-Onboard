-- +goose Up
-- +goose StatementBegin
CREATE TYPE group_type_enum AS ENUM (
    'team',
    'company'
);

ALTER TABLE IF EXISTS companies
ADD COLUMN group_type group_type_enum NOT NULL DEFAULT 'team';

ALTER TABLE IF EXISTS companies
ALTER COLUMN linkedin_url SET DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS companies
ALTER COLUMN linkedin_url DROP DEFAULT;

ALTER TABLE IF EXISTS companies
DROP COLUMN group_type;

DROP TYPE IF EXISTS group_type_enum;
-- +goose StatementEnd
