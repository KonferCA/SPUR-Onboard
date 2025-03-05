-- name: GetVerifyEmailTokenByID :one
SELECT id, user_id, created_at, expires_at
FROM verify_email_tokens
WHERE id = $1;

-- name: RemoveVerifyEmailTokenByID :exec
DELETE FROM verify_email_tokens WHERE id = $1;

-- name: NewVerifyEmailToken :one
INSERT INTO verify_email_tokens (user_id, expires_at)
VALUES ($1, $2) RETURNING id;

-- name: ExistsVerifyEmailTokenByUserID :one
SELECT EXISTS(SELECT 1 FROM verify_email_tokens WHERE user_id = $1);

-- name: RemoveVerifyEmailTokenByUserID :exec
DELETE FROM verify_email_tokens WHERE user_id = $1;
