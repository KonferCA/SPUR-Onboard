-- name: CreateQuestion :one
INSERT INTO questions (
    question_text
) VALUES (
    $1
)
RETURNING *;

-- name: GetQuestion :one
SELECT * FROM questions
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1;

-- name: ListQuestions :many
SELECT * FROM questions
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: SoftDeleteQuestion :exec
UPDATE questions
SET deleted_at = NOW()
WHERE id = $1;

-- name: CreateCompanyAnswer :one
INSERT INTO company_question_answers (
    company_id,
    question_id,
    answer_text
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetCompanyAnswer :one
SELECT 
    cqa.*,
    q.question_text
FROM company_question_answers cqa
JOIN questions q ON q.id = cqa.question_id
WHERE cqa.company_id = $1 AND cqa.question_id = $2 AND cqa.deleted_at IS NULL AND q.deleted_at IS NULL
LIMIT 1;

-- name: ListCompanyAnswers :many
SELECT 
    cqa.*,
    q.question_text
FROM company_question_answers cqa
JOIN questions q ON q.id = cqa.question_id
WHERE cqa.company_id = $1 AND cqa.deleted_at IS NULL AND q.deleted_at IS NULL
ORDER BY cqa.created_at DESC;

-- name: UpdateCompanyAnswer :one
UPDATE company_question_answers
SET 
    answer_text = $3,
    updated_at = NOW()
WHERE company_id = $1 AND question_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteCompanyAnswer :exec
UPDATE company_question_answers
SET deleted_at = NOW()
WHERE company_id = $1 AND question_id = $2;

-- name: DeleteQuestion :exec
UPDATE questions 
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;