-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
ADD COLUMN allow_edit BOOL NOT NULL DEFAULT false;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
DROP COLUMN allow_edit;
-- +goose StatementEnd
