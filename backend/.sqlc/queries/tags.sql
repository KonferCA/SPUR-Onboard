-- name: CreateTag :one
INSERT INTO tags (
    name
) VALUES (
    $1
)
RETURNING *;

-- name: GetTag :one
SELECT * FROM tags
WHERE id = $1 LIMIT 1;

-- name: ListTags :many
SELECT * FROM tags
ORDER BY name;

-- name: DeleteTag :exec
DELETE FROM tags
WHERE id = $1;