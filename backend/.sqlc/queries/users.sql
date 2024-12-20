-- name: GetUserByID :one
SELECT id, email, role, email_verified, token_salt
FROM users 
WHERE id = $1;

-- name: GetUserEmailVerifiedStatusByEmail :one
SELECT email_verified FROM users WHERE email = $1;

-- name: UpdateUserEmailVerifiedStatus :exec
UPDATE users SET email_verified = $1 WHERE id = $2;
