-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS project_questions
    ADD COLUMN input_props JSONB;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE IF EXISTS project_questions
    DROP COLUMN input_props;
-- +goose StatementEnd
