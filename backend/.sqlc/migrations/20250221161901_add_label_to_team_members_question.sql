-- +goose Up
-- +goose StatementBegin
UPDATE project_questions
    SET question = 'Added Members'
    WHERE question_key = 'team_section';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
UPDATE project_questions
    SET question = ''
    WHERE question_key = 'team_section';
-- +goose StatementEnd
