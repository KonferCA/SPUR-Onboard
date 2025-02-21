-- +goose Up
-- +goose StatementBegin

-- Create backup table for original states
CREATE TABLE project_questions_20250220_backup (
    id uuid PRIMARY KEY,
    section text NOT NULL,
    sub_section text NOT NULL,
    section_order int NOT NULL,
    sub_section_order int NOT NULL,
    question_order int NOT NULL
);

-- Store original states
INSERT INTO project_questions_20250220_backup
SELECT id, section, sub_section, section_order, sub_section_order, question_order
FROM project_questions;

-- 1. Rename the basics to the details
UPDATE project_questions
    SET section = 'The Details'
    WHERE section = 'The Basics';

-- 2. Reorder all existing sections
UPDATE project_questions
    SET section_order = section_order + 1;

-- 3. Move sub-sections "Introduction" and "Company Pitch" from "The Details" into "The Basics"
--    The Basics is the first section as well
UPDATE project_questions
    SET section = 'The Basics', section_order = 0
    WHERE section = 'The Details' AND sub_section IN ('Introduction', 'Company Pitch');

-- 4. Rename all the questions under the sub-section "Introduction" to be in sub-section "Bookkeeping"
UPDATE project_questions
    SET sub_section = 'Bookkeeping'
    WHERE section = 'The Basics' AND sub_section = 'Introduction';

-- 5. Move the "Company name" question to "Introduction" sub-section
UPDATE project_questions
    SET sub_section = 'Introduction', question_order = 0 -- first in sub-section
    WHERE question_key = 'company_name';

-- 6. Re-order the questions in the sub-section "Bookkeeping" (keeps the same ascending order but resets the number i.e: 0,3,5,6,9 to 0,1,2,3,4)
WITH ranked AS (
  SELECT
    id,
    question_order,
    ROW_NUMBER() OVER (ORDER BY question_order) - 1 AS new_order
  FROM project_questions WHERE section = 'The Basics' AND sub_section = 'Bookkeeping'
)
UPDATE project_questions
    SET question_order = ranked.new_order
    FROM ranked
    WHERE project_questions.id = ranked.id;

-- 7. Set the order for Bookkeeping to second in section
UPDATE project_questions
    SET sub_section_order = 1
    WHERE section = 'The Basics' AND sub_section = 'Bookkeeping';

-- 8. Set the order for company pitch to be third in section
UPDATE project_questions
    SET sub_section_order = 2
    WHERE section = 'The Basics' AND sub_section = 'Company Pitch';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Restore all questions to their original state
UPDATE project_questions pq
SET 
    section = backup.section,
    sub_section = backup.sub_section,
    section_order = backup.section_order,
    sub_section_order = backup.sub_section_order,
    question_order = backup.question_order
FROM project_questions_20250220_backup backup
WHERE pq.id = backup.id;

DROP TABLE project_questions_20250220_backup;
-- +goose StatementEnd
