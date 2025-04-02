-- +goose Up
-- +goose StatementBegin
UPDATE projects
SET title = pa.answer
FROM project_questions pq
JOIN project_answers pa ON pa.question_id = pq.id
WHERE
    projects.status = 'pending'
    AND pq.question_key = 'company_name'
    AND pa.answer IS NOT NULL
    AND pa.answer != ''
    AND pa.project_id = projects.id;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- No down migration since the titles will be updated and it is not crucial enough to store old values for a down migration
-- The updated projects are only those that have been submitted but the projects table title column was not updated with the proper name.
SELECT 1;
-- +goose StatementEnd
