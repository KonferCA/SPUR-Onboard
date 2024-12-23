// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: team_members.sql

package db

import (
	"context"
)

const createTeamMember = `-- name: CreateTeamMember :one
INSERT INTO team_members (
    company_id, first_name, last_name, 
    title, bio, linkedin_url, is_account_owner
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING id, company_id, first_name, last_name, title, bio, linkedin_url, is_account_owner, created_at, updated_at
`

type CreateTeamMemberParams struct {
	CompanyID      string
	FirstName      string
	LastName       string
	Title          string
	Bio            string
	LinkedinUrl    string
	IsAccountOwner bool
}

func (q *Queries) CreateTeamMember(ctx context.Context, arg CreateTeamMemberParams) (TeamMember, error) {
	row := q.db.QueryRow(ctx, createTeamMember,
		arg.CompanyID,
		arg.FirstName,
		arg.LastName,
		arg.Title,
		arg.Bio,
		arg.LinkedinUrl,
		arg.IsAccountOwner,
	)
	var i TeamMember
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.FirstName,
		&i.LastName,
		&i.Title,
		&i.Bio,
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteTeamMember = `-- name: DeleteTeamMember :exec
DELETE FROM team_members 
WHERE id = $1 AND company_id = $2
`

type DeleteTeamMemberParams struct {
	ID        string
	CompanyID string
}

func (q *Queries) DeleteTeamMember(ctx context.Context, arg DeleteTeamMemberParams) error {
	_, err := q.db.Exec(ctx, deleteTeamMember, arg.ID, arg.CompanyID)
	return err
}

const getTeamMember = `-- name: GetTeamMember :one
SELECT id, company_id, first_name, last_name, title, bio, linkedin_url, is_account_owner, created_at, updated_at FROM team_members 
WHERE id = $1 AND company_id = $2 
LIMIT 1
`

type GetTeamMemberParams struct {
	ID        string
	CompanyID string
}

func (q *Queries) GetTeamMember(ctx context.Context, arg GetTeamMemberParams) (TeamMember, error) {
	row := q.db.QueryRow(ctx, getTeamMember, arg.ID, arg.CompanyID)
	var i TeamMember
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.FirstName,
		&i.LastName,
		&i.Title,
		&i.Bio,
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listTeamMembers = `-- name: ListTeamMembers :many
SELECT id, company_id, first_name, last_name, title, bio, linkedin_url, is_account_owner, created_at, updated_at FROM team_members 
WHERE company_id = $1 
ORDER BY created_at DESC
`

func (q *Queries) ListTeamMembers(ctx context.Context, companyID string) ([]TeamMember, error) {
	rows, err := q.db.Query(ctx, listTeamMembers, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []TeamMember
	for rows.Next() {
		var i TeamMember
		if err := rows.Scan(
			&i.ID,
			&i.CompanyID,
			&i.FirstName,
			&i.LastName,
			&i.Title,
			&i.Bio,
			&i.LinkedinUrl,
			&i.IsAccountOwner,
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

const updateTeamMember = `-- name: UpdateTeamMember :one
UPDATE team_members 
SET 
    first_name = COALESCE(NULLIF($1::text, ''), first_name),
    last_name = COALESCE(NULLIF($2::text, ''), last_name),
    title = COALESCE(NULLIF($3::text, ''), title),
    bio = COALESCE(NULLIF($4::text, ''), bio),
    linkedin_url = COALESCE(NULLIF($5::text, ''), linkedin_url),
    updated_at = extract(epoch from now())
WHERE id = $6 AND company_id = $7
RETURNING id, company_id, first_name, last_name, title, bio, linkedin_url, is_account_owner, created_at, updated_at
`

type UpdateTeamMemberParams struct {
	FirstName   string
	LastName    string
	Title       string
	Bio         string
	LinkedinUrl string
	ID          string
	CompanyID   string
}

func (q *Queries) UpdateTeamMember(ctx context.Context, arg UpdateTeamMemberParams) (TeamMember, error) {
	row := q.db.QueryRow(ctx, updateTeamMember,
		arg.FirstName,
		arg.LastName,
		arg.Title,
		arg.Bio,
		arg.LinkedinUrl,
		arg.ID,
		arg.CompanyID,
	)
	var i TeamMember
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.FirstName,
		&i.LastName,
		&i.Title,
		&i.Bio,
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
