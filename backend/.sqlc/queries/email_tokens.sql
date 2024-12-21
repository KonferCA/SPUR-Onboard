-- name: GetVerifyEmailTokenByID :one
SELECT id, user_id, created_at, expires_at
FROM verify_email_tokens
WHERE id = $1;

-- name: RemoveVerifyEmailTokenByID :exec
DELETE FROM verify_email_tokens WHERE id = $1;
