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

-- name: GetProjectByIDAsAdmin :one
SELECT * FROM projects
WHERE id = $1
LIMIT 1;

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
INSERT INTO project_answers (project_id, question_id, answer, choices, updated_at)
    VALUES ($1, $2, $3, $4, extract(epoch from now()))
    ON CONFLICT (project_id, question_id)
    DO UPDATE
    SET answer = EXCLUDED.answer, choices = EXCLUDED.choices,
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
SELECT 
    p.id,
    p.company_id,
    COALESCE(
        (SELECT pa.answer 
         FROM project_answers pa
         JOIN project_questions pq ON pa.question_id = pq.id
         WHERE pa.project_id = p.id AND pq.question_key = 'company_name' AND pa.answer != ''
         LIMIT 1),
        p.title
    ) as title,
    p.description,
    p.status,
    p.allow_edit,
    p.created_at,
    p.updated_at,
    COUNT(d.id) as document_count,
    COUNT(t.id) as team_member_count
FROM projects p
LEFT JOIN project_documents d ON d.project_id = p.id
LEFT JOIN team_members t ON t.company_id = $1
WHERE p.company_id = $1
GROUP BY p.id
ORDER BY p.created_at DESC;

-- name: GetProjectQuestions :many
WITH all_questions AS (
    SELECT 
        pq.*,
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
    pq.*,
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

-- name: GetQuestionsByProjectAsAdmin :many
WITH project_owner_check AS (
   SELECT p.id 
   FROM projects p
   JOIN companies c ON p.company_id = c.id 
   WHERE p.id = $1
)
SELECT 
    pq.*,
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
SELECT pc.*, u.first_name as commenter_first_name, u.last_name as commenter_last_name FROM project_comments pc
JOIN users u ON u.id = pc.commenter_id
WHERE pc.project_id = $1
ORDER BY pc.created_at DESC;

-- name: GetProjectComment :one
SELECT pc.*, u.first_name as commenter_first_name, u.last_name as commenter_last_name FROM project_comments pc
JOIN users u ON u.id = pc.commenter_id
WHERE pc.id = $1 AND pc.project_id = $2
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

-- name: ListAllProjects :many
SELECT
    p.id,
    p.company_id,
    COALESCE(
        c.name,
        ''
    ) as company_name,
    p.title,
    p.description,
    p.status,
    p.allow_edit,
    p.created_at,
    p.updated_at,
    COUNT(d.id) as document_count,
    COUNT(t.id) as team_member_count
FROM projects p
LEFT JOIN project_documents d ON d.project_id = p.id
LEFT JOIN team_members t ON t.company_id = p.company_id
LEFT JOIN companies c ON c.id = p.company_id
GROUP BY p.id, c.id, c.name
ORDER BY p.created_at DESC;

-- name: GetNewProjectsByStatus :many
SELECT 
    p.id, 
    p.company_id, 
    COALESCE(
        (SELECT pa.answer 
         FROM project_answers pa
         JOIN project_questions pq ON pa.question_id = pq.id
         WHERE pa.project_id = p.id AND pq.question_key = 'company_name' AND pa.answer != ''
         LIMIT 1),
        p.title
    ) as title,
    p.description, 
    p.status, 
    p.allow_edit,
    p.created_at, 
    p.updated_at,
    c.name as company_name,
    COUNT(d.id) as document_count,
    COUNT(t.id) as team_member_count
FROM 
    projects p
LEFT JOIN 
    project_documents d ON d.project_id = p.id
LEFT JOIN 
    team_members t ON t.company_id = p.company_id
LEFT JOIN 
    companies c ON c.id = p.company_id
WHERE 
    p.status = $1
GROUP BY 
    p.id, c.name
ORDER BY 
    p.created_at DESC
LIMIT 
    $2;

-- name: GetNewProjectsAnyStatus :many
SELECT 
    p.id, 
    p.company_id, 
    COALESCE(
        (SELECT pa.answer 
         FROM project_answers pa
         JOIN project_questions pq ON pa.question_id = pq.id
         WHERE pa.project_id = p.id AND pq.question_key = 'company_name' AND pa.answer != ''
         LIMIT 1),
        p.title
    ) as title,
    p.description, 
    p.status, 
    p.allow_edit,
    p.created_at, 
    p.updated_at,
    c.name as company_name,
    COUNT(d.id) as document_count,
    COUNT(t.id) as team_member_count
FROM 
    projects p
LEFT JOIN 
    project_documents d ON d.project_id = p.id
LEFT JOIN 
    team_members t ON t.company_id = p.company_id
LEFT JOIN 
    companies c ON c.id = p.company_id
GROUP BY 
    p.id, c.name
ORDER BY 
    p.created_at DESC
LIMIT 
    $1;

-- name: MatchProjectTitleToCompanyNameQuestion :exec
UPDATE projects
SET title = (
	SELECT pa.answer
    FROM project_questions pq
    LEFT JOIN project_answers pa ON pa.question_id = pq.id
        AND pa.project_id = $1
        AND pa.answer IS NOT NULL
        AND pa.answer != ''
    WHERE pq.question_key = 'company_name'
    )
WHERE id = $1;

-- name: SetProjectAllowEdit :exec
UPDATE projects
SET allow_edit = $1
WHERE id = $2;

-- name: CountUnresolvedProjectComments :one
SELECT COUNT(*) FROM project_comments
WHERE project_id = $1 AND resolved = false;
