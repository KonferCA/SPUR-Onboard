-- +goose Up
-- +goose StatementBegin
ALTER TABLE project_questions
ADD COLUMN question_key VARCHAR(255) UNIQUE NULL; -- NULL at the end makes it possible to maintian uniqueness for non-null values
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE project_questions
DROP COLUMN question_key;
-- +goose StatementEnd
