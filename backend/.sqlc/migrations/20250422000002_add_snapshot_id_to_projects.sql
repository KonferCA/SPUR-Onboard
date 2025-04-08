-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
    ADD COLUMN last_snapshot_id UUID NULL REFERENCES project_snapshots(id) ON DELETE SET NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
    DROP COLUMN last_snapshot_id;
-- +goose StatementEnd
