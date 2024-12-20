-- name: GetUserByID :one
SELECT id, email, role, email_verified, token_salt
FROM users 
WHERE id = $1;

-- name: GetUserEmailVerifiedStatusByEmail :one
SELECT email_verified FROM users WHERE email = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1; 