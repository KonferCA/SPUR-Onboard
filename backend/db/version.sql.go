// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: version.sql

package db

import (
	"context"
)

const getDBVersion = `-- name: GetDBVersion :one
SELECT version()
`

func (q *Queries) GetDBVersion(ctx context.Context) (string, error) {
	row := q.db.QueryRow(ctx, getDBVersion)
	var version string
	err := row.Scan(&version)
	return version, err
}
