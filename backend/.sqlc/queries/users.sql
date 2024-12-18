-- name: GetUserByID :one
SELECT id, email, role, email_verified, token_salt
FROM users 
WHERE id = $1; 