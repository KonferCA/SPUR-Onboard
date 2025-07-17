-- +goose Up
-- +goose StatementBegin
ALTER TABLE projects ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_projects_featured;
ALTER TABLE projects DROP COLUMN IF EXISTS featured;
-- +goose StatementEnd
