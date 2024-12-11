// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: company.sql

package db

import (
	"context"
)

const createCompany = `-- name: CreateCompany :one
INSERT INTO companies (
    id,
    owner_user_id,
    name,
    description,
    is_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, 
    $2, 
    $3, 
    false, 
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING id, owner_user_id, name, description, is_verified, created_at, updated_at, deleted_at, industry, company_stage, founded_date
`

type CreateCompanyParams struct {
	OwnerUserID string
	Name        string
	Description *string
}

func (q *Queries) CreateCompany(ctx context.Context, arg CreateCompanyParams) (Company, error) {
	row := q.db.QueryRow(ctx, createCompany, arg.OwnerUserID, arg.Name, arg.Description)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerUserID,
		&i.Name,
		&i.Description,
		&i.IsVerified,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.DeletedAt,
		&i.Industry,
		&i.CompanyStage,
		&i.FoundedDate,
	)
	return i, err
}

const deleteCompany = `-- name: DeleteCompany :exec
DELETE FROM companies
WHERE id = $1
`

// TODO: Add + use auth to ensure only company owners can delete
func (q *Queries) DeleteCompany(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteCompany, id)
	return err
}

const getCompanyByID = `-- name: GetCompanyByID :one
SELECT id, owner_user_id, name, description, is_verified, created_at, updated_at, deleted_at, industry, company_stage, founded_date
FROM companies
WHERE id = $1 LIMIT 1
`

func (q *Queries) GetCompanyByID(ctx context.Context, id string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyByID, id)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerUserID,
		&i.Name,
		&i.Description,
		&i.IsVerified,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.DeletedAt,
		&i.Industry,
		&i.CompanyStage,
		&i.FoundedDate,
	)
	return i, err
}

const getCompanyByUser = `-- name: GetCompanyByUser :one
SELECT id, owner_user_id, name, description, is_verified, created_at, updated_at, deleted_at
FROM companies
WHERE owner_user_id = $1 LIMIT 1
`

func (q *Queries) GetCompanyByUser(ctx context.Context, ownerUserID string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyByUser, ownerUserID)
	var i Company
	err := row.Scan(
		&i.ID,
		&i.OwnerUserID,
		&i.Name,
		&i.Description,
		&i.IsVerified,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const listCompanies = `-- name: ListCompanies :many
SELECT id, owner_user_id, name, description, is_verified, created_at, updated_at, deleted_at, industry, company_stage, founded_date
FROM companies
ORDER BY updated_at DESC
`

func (q *Queries) ListCompanies(ctx context.Context) ([]Company, error) {
	rows, err := q.db.Query(ctx, listCompanies)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Company
	for rows.Next() {
		var i Company
		if err := rows.Scan(
			&i.ID,
			&i.OwnerUserID,
			&i.Name,
			&i.Description,
			&i.IsVerified,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.DeletedAt,
			&i.Industry,
			&i.CompanyStage,
			&i.FoundedDate,
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
