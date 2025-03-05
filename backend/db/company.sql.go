// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: company.sql

package db

import (
	"context"
)

const getCompany = `-- name: GetCompany :one
SELECT id, owner_id, name, description, date_founded, stages, website, wallet_address, linkedin_url, created_at, updated_at, group_type FROM companies WHERE id = $1 LIMIT 1
`

func (q *Queries) GetCompany(ctx context.Context, id string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompany, id)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.Description,
		&i.DateFounded,
		&i.Stages,
		&i.Website,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.GroupType,
	)
	return i, err
}
