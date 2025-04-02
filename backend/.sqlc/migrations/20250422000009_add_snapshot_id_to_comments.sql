-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS project_comments
ADD COLUMN resolved_by_snapshot_id UUID DEFAULT NULL;

ALTER TABLE IF EXISTS project_comments
ADD CONSTRAINT fk_resolved_by_snapshot_id
FOREIGN KEY (resolved_by_snapshot_id) REFERENCES project_snapshots(id)
ON DELETE SET NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS project_comments
DROP CONSTRAINT fk_resolved_by_snapshot_id;

ALTER TABLE IF EXISTS project_comments
DROP COLUMN resolved_by_snapshot_id;
-- +goose StatementEnd
