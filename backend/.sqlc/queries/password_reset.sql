-- name: GetResetPasswordTokenByID :one
SELECT id, user_id, created_at, expires_at
FROM password_reset_tokens
WHERE id = $1;

-- name: RemoveResetPasswordTokenByID :exec
DELETE FROM password_reset_tokens WHERE id = $1;

-- name: NewResetPasswordToken :one
INSERT INTO password_reset_tokens (user_id, expires_at)
VALUES ($1, $2) RETURNING id;

-- name: ExistsResetPasswordTokenByUserID :one
SELECT EXISTS(SELECT 1 FROM password_reset_tokens WHERE user_id = $1);

-- name: RemoveResetPasswordTokenByUserID :exec
DELETE FROM password_reset_tokens WHERE user_id = $1;

-- name: UpdateUserPassword :exec
UPDATE users SET password = $1, updated_at = extract(epoch from now())
WHERE id = $2; 