-- name: CreateResourceRequest :one
INSERT INTO resource_requests (
    id,
    company_id,
    resource_type,
    description,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetResourceRequestByID :one
SELECT * FROM resource_requests
WHERE id = $1 LIMIT 1;

-- name: ListResourceRequests :many
SELECT * FROM resource_requests
ORDER BY updated_at DESC;

-- name: ListResourceRequestsByCompany :many
SELECT * FROM resource_requests
WHERE company_id = $1
ORDER BY updated_at DESC;

-- name: DeleteResourceRequest :exec
DELETE FROM resource_requests
WHERE id = $1;

-- name: UpdateResourceRequestStatus :one
UPDATE resource_requests
SET 
    status = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;