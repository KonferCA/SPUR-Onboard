-- name: GetPasswordResetTokenByID :one
SELECT id, user_id, created_at, expires_at
FROM password_reset_tokens
WHERE id = $1;

-- name: RemovePasswordResetTokenByID :exec
DELETE FROM password_reset_tokens WHERE id = $1;

-- name: NewPasswordResetToken :one
INSERT INTO password_reset_tokens (user_id, expires_at)
VALUES ($1, $2) RETURNING id;

-- name: ExistsPasswordResetTokenByUserID :one
SELECT EXISTS(SELECT 1 FROM password_reset_tokens WHERE user_id = $1);

-- name: RemovePasswordResetTokenByUserID :exec
DELETE FROM password_reset_tokens WHERE user_id = $1;
