-- name: CreateUser :one
INSERT INTO users (
    email,
    password_hash,
    role,
    token_salt
) VALUES (
    $1, $2, $3, gen_random_bytes(32)
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

-- name: UpdateUserTokenSalt :exec
UPDATE users SET token_salt = gen_random_bytes(32)
WHERE id = $1;

-- name: GetUserTokenSalt :one
SELECT token_salt FROM users
WHERE id = $1;
