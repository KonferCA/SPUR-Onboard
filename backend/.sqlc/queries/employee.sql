-- name: CreateEmployee :one
INSERT INTO employees (
    company_id,
    name,
    email,
    role,
    bio
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetEmployeeByID :one
SELECT * FROM employees
WHERE id = $1 LIMIT 1;

-- name: GetEmployeeByEmail :one
SELECT * FROM employees
WHERE email = $1 LIMIT 1;

-- name: ListEmployees :many
SELECT * FROM employees
ORDER BY created_at DESC;

-- name: ListEmployeesByCompany :many
SELECT * FROM employees
WHERE company_id = $1
ORDER BY created_at DESC;

-- name: UpdateEmployee :one
UPDATE employees
SET 
    name = $2,
    role = $3,
    bio = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteEmployee :exec
DELETE FROM employees
WHERE id = $1;