-- name: CreateProject :one
INSERT INTO projects (
    company_id,
    title,
    description,
    status
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetProject :one
SELECT * FROM projects
WHERE id = $1 LIMIT 1;

-- name: ListProjects :many
SELECT * FROM projects
ORDER BY created_at DESC;

-- name: ListProjectsByCompany :many
SELECT * FROM projects
WHERE company_id = $1
ORDER BY created_at DESC;

-- name: UpdateProject :one
UPDATE projects
SET 
    title = $2,
    description = $3,
    status = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteProject :exec
DELETE FROM projects
WHERE id = $1;

-- name: CreateProjectFile :one
INSERT INTO project_files (
    project_id,
    file_type,
    file_url
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: ListProjectFiles :many
SELECT * FROM project_files
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: DeleteProjectFile :exec
DELETE FROM project_files
WHERE id = $1;

-- name: CreateProjectComment :one
INSERT INTO project_comments (
    project_id,
    user_id,
    comment
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetProjectComments :many
SELECT 
    pc.*,
    u.first_name,
    u.last_name,
    u.email
FROM project_comments pc
JOIN users u ON u.id = pc.user_id
WHERE pc.project_id = $1
ORDER BY pc.created_at DESC;

-- name: DeleteProjectComment :exec
DELETE FROM project_comments
WHERE id = $1;

-- name: CreateProjectLink :one
INSERT INTO project_links (
    project_id,
    link_type,
    url
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: ListProjectLinks :many
SELECT * FROM project_links
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: DeleteProjectLink :exec
DELETE FROM project_links
WHERE id = $1;

-- name: AddProjectTag :one
INSERT INTO project_tags (
    project_id,
    tag_id
) VALUES (
    $1, $2
)
RETURNING *;

-- name: ListProjectTags :many
SELECT 
    pt.*,
    t.name as tag_name
FROM project_tags pt
JOIN tags t ON t.id = pt.tag_id
WHERE pt.project_id = $1
ORDER BY t.name;

-- name: DeleteProjectTag :exec
DELETE FROM project_tags 
WHERE project_id = $1 AND tag_id = $2;

-- name: DeleteAllProjectTags :exec
DELETE FROM project_tags 
WHERE project_id = $1;