-- +goose Up
-- +goose StatementBegin
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    input_type,
    input_props,
    question_key
) VALUES
(
    'Upload featured images',
    'The Basics',
    'Introduction',
    0,
    0,
    1,
    'file',
    '{"accept": ".png,.jpeg,.jpg"}',
    'company_featured_images'
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions WHERE question_key = 'company_featured_images';
-- +goose StatementEnd
