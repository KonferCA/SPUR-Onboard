-- +goose Up
-- +goose StatementBegin

-- reorder the questions in The Basics -> Introduction
UPDATE project_questions
SET
    question_order = question_order + 1
WHERE
    section = 'The Basics'
    AND sub_section = 'Introduction'
    AND question_order > 1;

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    options,
    disabled,
    question_key
) VALUES (
    'What technical industry is your company focused on?',
    'The Basics',
    'Introduction',
    0, 0, 2,
    true,
    'multiselect',
    ARRAY[
        'Artificial Intelligence (AI)',
        'Web3 & Blockchain',
        'Quantum Computing & Technology',
        'Robotics',
        'Internet of Things (IoT)',
        'SaaS',
        'Fintech',
        'Consulting',
        'Health & Medical Technology',
        'Education',
        'Entertainment',
        'E-commerce',
        'Cybersecurity',
        'Hardware',
        'Augmented & Virtual Reality (AR & VR)',
        'Cloud Computing',
        'Nanotechnology',
        'Telecommunications',
        'Other'
    ],
    false,
    'company_industries'
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions WHERE question_key = 'company_industries';
UPDATE project_questions
SET
    question_order = question_order - 1
WHERE
    section = 'The Basics'
    AND sub_section = 'Introduction'
    AND question_order > 2;
-- +goose StatementEnd
