-- +goose Up
-- +goose StatementBegin
ALTER TYPE project_status ADD VALUE 'needs review';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE projects ALTER COLUMN status DROP DEFAULT;

CREATE TYPE project_status_new AS ENUM (
    'draft',
    'pending',
    'verified',
    'declined',
    'withdrawn'
);
ALTER TABLE projects
  ALTER COLUMN status
  TYPE project_status_new
  USING status::text::project_status_new;
DROP TYPE project_status;
ALTER TYPE project_status_new RENAME TO project_status;

ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'draft'::text::project_status;
-- +goose StatementEnd
