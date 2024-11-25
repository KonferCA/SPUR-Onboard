-- name: CreateCompany :one
INSERT INTO companies (
    id,
    owner_user_id,
    name,
    description,
    is_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, 
    $2, 
    $3, 
    false, 
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetCompanyByID :one
SELECT *
FROM companies
WHERE id = $1 LIMIT 1;

-- name: ListCompanies :many
SELECT *
FROM companies
ORDER BY updated_at DESC;

-- name: DeleteCompany :exec
-- TODO: Add + use auth to ensure only company owners can delete 
DELETE FROM companies
WHERE id = $1;