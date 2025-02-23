-- +goose Up
-- +goose StatementBegin
UPDATE project_questions
    SET disabled = false
    WHERE question_key = 'company_name';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
UPDATE project_questions
    SET disabled = true
    WHERE question_key = 'company_name';
-- +goose StatementEnd
