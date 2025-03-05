-- name: GetCompany :one
SELECT * FROM companies WHERE id = $1 LIMIT 1;