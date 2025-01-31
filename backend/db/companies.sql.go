// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: companies.sql

package db

import (
	"context"
)

const createCompany = `-- name: CreateCompany :one
INSERT INTO companies (
  owner_id,
  name,
  wallet_address,
  linkedin_url
) VALUES (
  $1, $2, $3, $4
)
RETURNING id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at
`

type CreateCompanyParams struct {
	OwnerID       string  `json:"owner_id"`
	Name          string  `json:"name"`
	WalletAddress *string `json:"wallet_address"`
	LinkedinUrl   string  `json:"linkedin_url"`
}

func (q *Queries) CreateCompany(ctx context.Context, arg CreateCompanyParams) (Company, error) {
	row := q.db.QueryRow(ctx, createCompany,
		arg.OwnerID,
		arg.Name,
		arg.WalletAddress,
		arg.LinkedinUrl,
	)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteCompany = `-- name: DeleteCompany :exec
DELETE FROM companies
WHERE id = $1
`

func (q *Queries) DeleteCompany(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteCompany, id)
	return err
}

const getCompanyByID = `-- name: GetCompanyByID :one
SELECT id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at FROM companies
WHERE id = $1
`

func (q *Queries) GetCompanyByID(ctx context.Context, id string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyByID, id)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getCompanyByOwnerID = `-- name: GetCompanyByOwnerID :one
SELECT id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at FROM companies
WHERE owner_id = $1
`

func (q *Queries) GetCompanyByOwnerID(ctx context.Context, ownerID string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyByOwnerID, ownerID)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getCompanyWithAuth = `-- name: GetCompanyWithAuth :one
SELECT id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at FROM companies 
WHERE (owner_id = $1 OR $2 = 'admin') AND id = $3
`

type GetCompanyWithAuthParams struct {
	OwnerID string      `json:"owner_id"`
	Column2 interface{} `json:"column_2"`
	ID      string      `json:"id"`
}

func (q *Queries) GetCompanyWithAuth(ctx context.Context, arg GetCompanyWithAuthParams) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyWithAuth, arg.OwnerID, arg.Column2, arg.ID)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listCompanies = `-- name: ListCompanies :many
SELECT id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at FROM companies
WHERE owner_id = $1
ORDER BY created_at DESC
`

func (q *Queries) ListCompanies(ctx context.Context, ownerID string) ([]Company, error) {
	rows, err := q.db.Query(ctx, listCompanies, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Company
	for rows.Next() {
		var i Company
		if err := rows.Scan(
			&i.ID,
			&i.OwnerID,
			&i.Name,
			&i.WalletAddress,
			&i.LinkedinUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateCompany = `-- name: UpdateCompany :one
UPDATE companies
SET 
  name = COALESCE($2, name),
  wallet_address = COALESCE($3, wallet_address),
  linkedin_url = COALESCE($4, linkedin_url),
  updated_at = extract(epoch from now())
WHERE id = $1
RETURNING id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at
`

type UpdateCompanyParams struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	WalletAddress *string `json:"wallet_address"`
	LinkedinUrl   string  `json:"linkedin_url"`
}

func (q *Queries) UpdateCompany(ctx context.Context, arg UpdateCompanyParams) (Company, error) {
	row := q.db.QueryRow(ctx, updateCompany,
		arg.ID,
		arg.Name,
		arg.WalletAddress,
		arg.LinkedinUrl,
	)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerID,
		&i.Name,
		&i.WalletAddress,
		&i.LinkedinUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
