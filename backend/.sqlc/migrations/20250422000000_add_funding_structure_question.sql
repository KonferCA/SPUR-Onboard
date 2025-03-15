-- +goose Up
-- +goose StatementBegin

-- Create a new enum type with the additional value
CREATE TYPE input_type_enum_new AS ENUM (
    'url',
    'file',
    'textarea',
    'textinput',
    'select',
    'multiselect',
    'team',
    'date',
    'fundingstructure'
);

-- Update the column to use the new type
ALTER TABLE project_questions 
    ALTER COLUMN input_type TYPE input_type_enum_new 
    USING input_type::text::input_type_enum_new;
    
-- Drop the old type
DROP TYPE input_type_enum;

-- Rename the new type to the original name
ALTER TYPE input_type_enum_new RENAME TO input_type_enum;

-- now add the funding structure question
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_key
) VALUES (
    'Funding Structure',
    'The Basics',
    'Funding Structure',
    0, 4, 0, -- position after Business Overview (sub_section_order = 3)
    true,
    'fundingstructure', -- custom input type
    'funding_structure'
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- remove the question
DELETE FROM project_questions WHERE question_key = 'funding_structure';

-- we can't easily downgrade the enum type, so we'll leave it as is
-- +goose StatementEnd 