-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS project_snapshots (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    title VARCHAR NOT NULL,
    description VARCHAR,
    parent_snapshot_id UUID REFERENCES project_snapshots(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL DEFAULT extract(epoch FROM now())
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS project_snapshots;
-- +goose StatementEnd
