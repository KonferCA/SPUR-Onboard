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
INSERT INTO project_answers (project_id, question_id, input_type_id, answer, updated_at)
    VALUES ($1, $2, $3, $4, extract(epoch from now()))
    ON CONFLICT (project_id, question_id, input_type_id)
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
INSERT INTO project_answers (id, project_id, question_id, input_type_id, answer)
SELECT 
    gen_random_uuid(),
    $1,  -- project_id
    pq.id,
    qit.id, -- input_type_id
    ''   -- empty default answer
FROM project_questions pq
JOIN question_input_types qit ON qit.question_id = pq.id
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
        qit.id AS input_type_id,
        qit.input_type,
        qit.options,
        pq.required,
        qit.validations,
        qitc.id AS conditional_input_type_id,
        qitc.condition_type,
        qitc.condition_value,
        qitc.input_type AS conditional_input_type,
        qitc.options AS conditional_options,
        qitc.validations AS conditional_validations,
        COALESCE(pa.answer, '') AS answer,
        COALESCE(pa_cond.answer, '') AS conditional_answer
    FROM project_questions pq
    JOIN question_input_types qit ON qit.question_id = pq.id
    LEFT JOIN question_input_type_conditions qitc ON qitc.question_id = pq.id 
        AND qitc.parent_input_type_id = qit.id
    LEFT JOIN project_answers pa ON pa.question_id = pq.id 
        AND pa.input_type_id = qit.id 
    LEFT JOIN project_answers pa_cond ON pa_cond.question_id = pq.id
        AND pa_cond.conditional_input_type_id = qitc.id
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
),
all_questions AS (
    SELECT 
        pq.id,
        pq.question,
        pq.section,
        pq.sub_section,
        pq.section_order,
        pq.sub_section_order,
        pq.question_order,
        qit.id AS input_type_id,
        qit.input_type,
        qit.options,
        pq.required,
        qit.validations,
        qitc.id AS conditional_input_type_id,
        qitc.condition_type,
        qitc.condition_value,
        qitc.input_type AS conditional_input_type,
        qitc.options AS conditional_options,
        qitc.validations AS conditional_validations,
        COALESCE(pa.answer, '') AS answer,
        COALESCE(pa_cond.answer, '') AS conditional_answer
    FROM project_questions pq
    JOIN question_input_types qit ON qit.question_id = pq.id
    LEFT JOIN question_input_type_conditions qitc ON qitc.question_id = pq.id 
        AND qitc.parent_input_type_id = qit.id
    LEFT JOIN project_answers pa ON pa.question_id = pq.id 
        AND pa.input_type_id = qit.id 
        AND pa.project_id = $1
    LEFT JOIN project_answers pa_cond ON pa_cond.question_id = pq.id
        AND pa_cond.conditional_input_type_id = qitc.id
        AND pa_cond.project_id = $1
   WHERE EXISTS (SELECT 1 FROM project_owner_check)
)
SELECT * FROM all_questions
ORDER BY
   section_order,
   sub_section_order,
   question_order;

-- name: UpdateProjectStatus :exec
UPDATE projects 
SET 
    status = $1,
    updated_at = extract(epoch from now())
WHERE id = $2; 

-- name: GetQuestionByAnswerID :one
SELECT q.*, qit.validations, qit.input_type FROM project_questions q
JOIN project_answers a ON a.question_id = q.id
JOIN question_input_types qit ON qit.question_id = a.question_id
WHERE a.id = $1; 

-- name: GetProjectQuestion :one
SELECT q.*, qit.validations, qit.id as input_type_id FROM project_questions q
JOIN question_input_types qit ON q.id = qit.question_id
WHERE q.id = $1
LIMIT 1;

-- name: CreateProjectAnswer :one
INSERT INTO project_answers (
    project_id,
    question_id,
    input_type_id,
    answer
) VALUES (
    $1, -- project_id
    $2, -- question_id
    $3, -- input_type_id
    $4  -- answer
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
