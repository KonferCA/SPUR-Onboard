-- +goose Up
INSERT INTO project_questions (id, question, section, required, validations) VALUES 
    (
        gen_random_uuid(), 
        'What is the core product or service, and what problem does it solve?', 
        'business_overview',
        true,
        'min=100'  -- Warning if less than 100 chars
    ),
    (
        gen_random_uuid(), 
        'What is the unique value proposition?', 
        'business_overview',
        true,
        'min=50'  -- Warning if less than 50 chars
    ),
    (
        gen_random_uuid(), 
        'Company website', 
        'business_overview',
        true,
        'url'  -- Error if not valid URL
    );

-- +goose Down
DELETE FROM project_questions WHERE section = 'business_overview'; 