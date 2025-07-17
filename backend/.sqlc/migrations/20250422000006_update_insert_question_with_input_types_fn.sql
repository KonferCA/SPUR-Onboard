-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION insert_question_with_input_types(
    question_text TEXT,
    section_text TEXT,
    sub_section_text TEXT,
    section_order INT,
    sub_section_order INT,
    question_order INT,
    is_required BOOLEAN,
    input_type_value TEXT,
    question_key VARCHAR(255),
    options_array TEXT[] DEFAULT NULL,
    validations_array TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        question_key,
        options,
        validations
    ) VALUES (
        question_text,
        section_text,
        sub_section_text,
        section_order,
        sub_section_order,
        question_order,
        is_required,
        input_type_value::input_type_enum,
        question_key,
        options_array,
        validations_array
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS insert_question_with_input_types(
    question_text TEXT,
    section_text TEXT,
    sub_section_text TEXT,
    section_order INT,
    sub_section_order INT,
    question_order INT,
    is_required BOOLEAN,
    input_type_value TEXT,
    question_key VARCHAR(255),
    options_array TEXT[],
    validations_array TEXT[]
);
-- +goose StatementEnd 
