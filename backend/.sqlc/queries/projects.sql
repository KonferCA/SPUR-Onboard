-- name: GetCompanyByUserID :one
SELECT * FROM companies 
WHERE owner_id = $1 
LIMIT 1;

-- name: GetProjectCountOwnedByCompany :one
SELECT COUNT(id) FROM projects WHERE company_id = $1;

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
WHERE id = $1 
  AND (company_id = $2 OR $3 & 1 = 1) -- Check for PermViewAllProjects (1 << 0)
LIMIT 1;

-- name: UpdateProjectAnswer :one
UPDATE project_answers 
SET 
    answer = $1,
    updated_at = extract(epoch from now())
WHERE 
    project_answers.id = $2 
    AND project_id = $3
RETURNING *; 

-- name: UpdateProjectDraft :batchexec
INSERT INTO project_answers (project_id, question_id, answer, updated_at)
    VALUES ($1, $2, $3, extract(epoch from now()))
    ON CONFLICT (project_id, question_id)
    DO UPDATE
    SET answer = EXCLUDED.answer,
    updated_at = EXCLUDED.updated_at;

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
    question_id,
    name,
    url,
    section,
    sub_section,
    mime_type,
    size,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, -- project_id
    $2, -- question_id
    $3, -- name
    $4, -- url
    $5, -- section
    $6, -- sub_section
    $7, -- mime_type
    $8, -- size in bytes
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
WITH all_questions AS (
    SELECT 
        pq.id,
        pq.question,
        pq.section,
        pq.sub_section,
        pq.section_order,
        pq.sub_section_order,
        pq.question_order,
        pq.input_type,
        pq.options,
        pq.required,
        pq.validations,
        pq.condition_type,
        pq.condition_value,
        pq.dependent_question_id,
        pq.question_group_id,
        pq.placeholder,
        pq.description,
        pq.disabled,
        '' AS answer, -- these are here to match the query output when fetching QA for a project
        ARRAY[]::text[] as choices -- same here
    FROM project_questions pq
)
SELECT * FROM all_questions
ORDER BY
    section_order,
    sub_section_order,
    question_order;

-- name: GetQuestionsByProject :many
WITH project_owner_check AS (
   SELECT p.id 
   FROM projects p
   JOIN companies c ON p.company_id = c.id 
   WHERE p.id = $1
   AND c.owner_id = $2
)
SELECT 
    pq.id,
    pq.question,
    pq.section,
    pq.sub_section,
    pq.section_order,
    pq.sub_section_order,
    pq.question_order,
    pq.input_type,
    pq.options,
    pq.required,
    pq.validations,
    pq.condition_type,
    pq.condition_value,
    pq.dependent_question_id,
    pq.question_group_id,
    pq.placeholder,
    pq.description,
    pq.disabled,
    COALESCE(pa.answer, '') AS answer,
    COALESCE(pa.choices, ARRAY[]::text[]) as choices
FROM project_questions pq
LEFT JOIN project_answers pa ON pa.question_id = pq.id 
    AND pa.project_id = $1
WHERE EXISTS (SELECT 1 FROM project_owner_check)
ORDER BY
    pq.section_order,
    pq.sub_section_order,
    pq.question_order;

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

-- name: GetProjectQuestion :one
SELECT * FROM project_questions
WHERE id = $1
LIMIT 1;

-- name: CreateProjectAnswer :one
INSERT INTO project_answers (
    project_id,
    question_id,
    answer
) VALUES (
    $1, -- project_id
    $2, -- question_id
    $3  -- answer
) RETURNING *;

-- name: GetProjectComments :many
SELECT * FROM project_comments
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: GetProjectComment :one
SELECT * FROM project_comments
WHERE id = $1 AND project_id = $2
LIMIT 1;

-- name: CreateProjectComment :one
INSERT INTO project_comments (
    project_id,
    target_id,
    comment,
    commenter_id
) VALUES (
    $1, -- project_id
    $2, -- target_id
    $3, -- comment
    $4  -- commenter_id
) RETURNING *;

-- name: UpdateProjectComment :one
UPDATE project_comments
SET comment = $2,
    updated_at = extract(epoch from now())
WHERE id = $1
RETURNING *;

-- name: DeleteProjectComment :exec
DELETE FROM project_comments
WHERE id = $1; 

-- name: ResolveProjectComment :one
UPDATE project_comments
SET 
    resolved = true,
    updated_at = extract(epoch from now())
WHERE id = $1 AND project_id = $2
RETURNING *;

-- name: UnresolveProjectComment :one
UPDATE project_comments
SET 
    resolved = false,
    updated_at = extract(epoch from now())
WHERE id = $1 AND project_id = $2
RETURNING *; 
