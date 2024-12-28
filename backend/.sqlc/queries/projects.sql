-- name: GetCompanyByUserID :one
SELECT * FROM companies 
WHERE owner_id = $1 
LIMIT 1;

-- name: CreateProject :one
INSERT INTO projects (
    company_id,
    title,
    description,
    status,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *; 

-- name: GetProjectsByCompanyID :many
SELECT * FROM projects 
WHERE company_id = $1 
ORDER BY created_at DESC; 

-- name: GetProjectByID :one
SELECT * FROM projects 
WHERE id = $1 AND company_id = $2 
LIMIT 1; 

-- name: UpdateProjectAnswer :one
UPDATE project_answers 
SET 
    answer = $1,
    updated_at = extract(epoch from now())
WHERE 
    project_answers.id = $2 
    AND project_id = $3 
    AND project_id IN (
        SELECT projects.id 
        FROM projects 
        WHERE projects.company_id = $4
    )
RETURNING *; 

-- name: GetProjectAnswers :many
SELECT 
    pa.id as answer_id,
    pa.answer,
    pq.id as question_id,
    pq.question,
    pq.section
FROM project_answers pa
JOIN project_questions pq ON pa.question_id = pq.id
WHERE pa.project_id = $1
ORDER BY pq.section, pq.id;

-- name: CreateProjectAnswers :many
INSERT INTO project_answers (id, project_id, question_id, answer)
SELECT 
    gen_random_uuid(),
    $1,  -- project_id
    pq.id,
    ''   -- empty default answer
FROM project_questions pq
RETURNING *; 

-- name: CreateProjectDocument :one
INSERT INTO project_documents (
    id,
    project_id,
    name,
    url,
    section,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, -- project_id
    $2, -- name
    $3, -- url
    $4, -- section
    extract(epoch from now()),
    extract(epoch from now())
) RETURNING *;

-- name: GetProjectDocuments :many
SELECT * FROM project_documents
WHERE project_id = $1
ORDER BY created_at DESC; 

-- name: DeleteProjectDocument :one
DELETE FROM project_documents 
WHERE project_documents.id = $1 
AND project_documents.project_id = $2 
AND project_documents.project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.company_id = $3
)
RETURNING id;

-- name: GetProjectDocument :one
SELECT project_documents.* FROM project_documents
JOIN projects ON project_documents.project_id = projects.id
WHERE project_documents.id = $1 
AND project_documents.project_id = $2
AND projects.company_id = $3;

-- name: ListCompanyProjects :many
SELECT projects.* FROM projects
WHERE company_id = $1
ORDER BY created_at DESC; 

-- name: GetProjectQuestions :many
SELECT id, question, section, required, validations FROM project_questions;

-- name: UpdateProjectStatus :exec
UPDATE projects 
SET 
    status = $1,
    updated_at = extract(epoch from now())
WHERE id = $2; 

-- name: GetQuestionByAnswerID :one
SELECT q.* FROM project_questions q
JOIN project_answers a ON a.question_id = q.id
WHERE a.id = $1; 