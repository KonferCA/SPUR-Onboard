-- name: CreateUser :one
INSERT INTO users (
    email,
    password_hash,
    role
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 LIMIT 1; 

-- name: UpdateUserEmailVerifiedStatus :exec
UPDATE users SET email_verified = $1
WHERE id = $2;
