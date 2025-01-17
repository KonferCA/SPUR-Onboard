// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: email_tokens.sql

package db

import (
	"context"
)

const existsVerifyEmailTokenByUserID = `-- name: ExistsVerifyEmailTokenByUserID :one
SELECT EXISTS(SELECT 1 FROM verify_email_tokens WHERE user_id = $1)
`

func (q *Queries) ExistsVerifyEmailTokenByUserID(ctx context.Context, userID string) (bool, error) {
	row := q.db.QueryRow(ctx, existsVerifyEmailTokenByUserID, userID)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}

const getVerifyEmailTokenByID = `-- name: GetVerifyEmailTokenByID :one
SELECT id, user_id, created_at, expires_at
FROM verify_email_tokens
WHERE id = $1
`

func (q *Queries) GetVerifyEmailTokenByID(ctx context.Context, id string) (VerifyEmailToken, error) {
	row := q.db.QueryRow(ctx, getVerifyEmailTokenByID, id)
	var i VerifyEmailToken
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.CreatedAt,
		&i.ExpiresAt,
	)
	return i, err
}

const newVerifyEmailToken = `-- name: NewVerifyEmailToken :one
INSERT INTO verify_email_tokens (user_id, expires_at)
VALUES ($1, $2) RETURNING id
`

type NewVerifyEmailTokenParams struct {
	UserID    string `json:"user_id"`
	ExpiresAt int64  `json:"expires_at"`
}

func (q *Queries) NewVerifyEmailToken(ctx context.Context, arg NewVerifyEmailTokenParams) (string, error) {
	row := q.db.QueryRow(ctx, newVerifyEmailToken, arg.UserID, arg.ExpiresAt)
	var id string
	err := row.Scan(&id)
	return id, err
}

const removeVerifyEmailTokenByID = `-- name: RemoveVerifyEmailTokenByID :exec
DELETE FROM verify_email_tokens WHERE id = $1
`

func (q *Queries) RemoveVerifyEmailTokenByID(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, removeVerifyEmailTokenByID, id)
	return err
}

const removeVerifyEmailTokenByUserID = `-- name: RemoveVerifyEmailTokenByUserID :exec
DELETE FROM verify_email_tokens WHERE user_id = $1
`

func (q *Queries) RemoveVerifyEmailTokenByUserID(ctx context.Context, userID string) error {
	_, err := q.db.Exec(ctx, removeVerifyEmailTokenByUserID, userID)
	return err
}
