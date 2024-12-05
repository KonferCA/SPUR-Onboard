// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: verify_email_tokens.sql

package db

import (
	"context"
	"time"
)

const createVerifyEmailToken = `-- name: CreateVerifyEmailToken :one
INSERT INTO verify_email_tokens (
    email,
    expires_at
) VALUES (
    $1, $2
) RETURNING id, email, expires_at, created_at
`

type CreateVerifyEmailTokenParams struct {
	Email     string
	ExpiresAt time.Time
}

func (q *Queries) CreateVerifyEmailToken(ctx context.Context, arg CreateVerifyEmailTokenParams) (VerifyEmailToken, error) {
	row := q.db.QueryRow(ctx, createVerifyEmailToken, arg.Email, arg.ExpiresAt)
	var i VerifyEmailToken
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.ExpiresAt,
		&i.CreatedAt,
	)
	return i, err
}

const deleteVerifyEmailTokenByID = `-- name: DeleteVerifyEmailTokenByID :exec
DELETE FROM verify_email_tokens
WHERE id = $1
`

func (q *Queries) DeleteVerifyEmailTokenByID(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteVerifyEmailTokenByID, id)
	return err
}

const getVerifyEmailTokenByID = `-- name: GetVerifyEmailTokenByID :one
SELECT id, email, expires_at, created_at FROM verify_email_tokens
WHERE id = $1 LIMIT 1
`

func (q *Queries) GetVerifyEmailTokenByID(ctx context.Context, id string) (VerifyEmailToken, error) {
	row := q.db.QueryRow(ctx, getVerifyEmailTokenByID, id)
	var i VerifyEmailToken
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.ExpiresAt,
		&i.CreatedAt,
	)
	return i, err
}
