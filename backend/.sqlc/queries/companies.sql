-- name: CreateCompany :one
INSERT INTO companies (
  owner_id,
  name,
  wallet_address,
  linkedin_url
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: GetCompanyByID :one
SELECT * FROM companies
WHERE id = $1;

-- name: GetCompanyByOwnerID :one
SELECT * FROM companies
WHERE owner_id = $1;

-- name: UpdateCompany :one
UPDATE companies
SET 
  name = COALESCE($2, name),
  wallet_address = COALESCE($3, wallet_address),
  linkedin_url = COALESCE($4, linkedin_url),
  updated_at = extract(epoch from now())
WHERE id = $1
RETURNING *;

-- name: DeleteCompany :exec
DELETE FROM companies
WHERE id = $1;

-- name: ListCompanies :many
SELECT * FROM companies
WHERE owner_id = $1
ORDER BY created_at DESC;

-- name: GetCompanyWithAuth :one
SELECT * FROM companies 
WHERE (owner_id = $1 OR $2 = 'admin') AND id = $3;