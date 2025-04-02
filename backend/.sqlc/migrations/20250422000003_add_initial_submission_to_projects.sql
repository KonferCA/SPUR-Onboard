-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
    ADD COLUMN original_submission_at BIGINT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS projects
    DROP COLUMN original_submission_at;
-- +goose StatementEnd
