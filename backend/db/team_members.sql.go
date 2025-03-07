// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: team_members.sql

package db

import (
	"context"
)

const createTeamMember = `-- name: CreateTeamMember :one
INSERT INTO team_members (
    company_id, first_name, last_name, 
    title, linkedin_url, is_account_owner,
    personal_website, commitment_type, introduction,
    industry_experience, detailed_biography, previous_work,
    resume_external_url, resume_internal_url,
    founders_agreement_external_url, founders_agreement_internal_url
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13, $14, $15, $16
)
RETURNING id, company_id, first_name, last_name, title, linkedin_url, is_account_owner, personal_website, commitment_type, introduction, industry_experience, detailed_biography, previous_work, resume_external_url, resume_internal_url, founders_agreement_external_url, founders_agreement_internal_url, created_at, updated_at
`

type CreateTeamMemberParams struct {
	CompanyID                    string  `json:"company_id"`
	FirstName                    string  `json:"first_name"`
	LastName                     string  `json:"last_name"`
	Title                        string  `json:"title"`
	LinkedinUrl                  string  `json:"linkedin_url"`
	IsAccountOwner               bool    `json:"is_account_owner"`
	PersonalWebsite              *string `json:"personal_website"`
	CommitmentType               string  `json:"commitment_type"`
	Introduction                 string  `json:"introduction"`
	IndustryExperience           string  `json:"industry_experience"`
	DetailedBiography            string  `json:"detailed_biography"`
	PreviousWork                 *string `json:"previous_work"`
	ResumeExternalUrl            *string `json:"resume_external_url"`
	ResumeInternalUrl            *string `json:"resume_internal_url"`
	FoundersAgreementExternalUrl *string `json:"founders_agreement_external_url"`
	FoundersAgreementInternalUrl *string `json:"founders_agreement_internal_url"`
}

func (q *Queries) CreateTeamMember(ctx context.Context, arg CreateTeamMemberParams) (TeamMember, error) {
	row := q.db.QueryRow(ctx, createTeamMember,
		arg.CompanyID,
		arg.FirstName,
		arg.LastName,
		arg.Title,
		arg.LinkedinUrl,
		arg.IsAccountOwner,
		arg.PersonalWebsite,
		arg.CommitmentType,
		arg.Introduction,
		arg.IndustryExperience,
		arg.DetailedBiography,
		arg.PreviousWork,
		arg.ResumeExternalUrl,
		arg.ResumeInternalUrl,
		arg.FoundersAgreementExternalUrl,
		arg.FoundersAgreementInternalUrl,
	)
	var i TeamMember
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.FirstName,
		&i.LastName,
		&i.Title,
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.PersonalWebsite,
		&i.CommitmentType,
		&i.Introduction,
		&i.IndustryExperience,
		&i.DetailedBiography,
		&i.PreviousWork,
		&i.ResumeExternalUrl,
		&i.ResumeInternalUrl,
		&i.FoundersAgreementExternalUrl,
		&i.FoundersAgreementInternalUrl,
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
	ID        string `json:"id"`
	CompanyID string `json:"company_id"`
}

func (q *Queries) DeleteTeamMember(ctx context.Context, arg DeleteTeamMemberParams) error {
	_, err := q.db.Exec(ctx, deleteTeamMember, arg.ID, arg.CompanyID)
	return err
}

const getTeamMember = `-- name: GetTeamMember :one
SELECT id, company_id, first_name, last_name, title, linkedin_url, is_account_owner, personal_website, commitment_type, introduction, industry_experience, detailed_biography, previous_work, resume_external_url, resume_internal_url, founders_agreement_external_url, founders_agreement_internal_url, created_at, updated_at FROM team_members 
WHERE id = $1 AND company_id = $2 
LIMIT 1
`

type GetTeamMemberParams struct {
	ID        string `json:"id"`
	CompanyID string `json:"company_id"`
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
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.PersonalWebsite,
		&i.CommitmentType,
		&i.Introduction,
		&i.IndustryExperience,
		&i.DetailedBiography,
		&i.PreviousWork,
		&i.ResumeExternalUrl,
		&i.ResumeInternalUrl,
		&i.FoundersAgreementExternalUrl,
		&i.FoundersAgreementInternalUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listTeamMembers = `-- name: ListTeamMembers :many
SELECT id, company_id, first_name, last_name, title, linkedin_url, is_account_owner, personal_website, commitment_type, introduction, industry_experience, detailed_biography, previous_work, resume_external_url, resume_internal_url, founders_agreement_external_url, founders_agreement_internal_url, created_at, updated_at FROM team_members 
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
			&i.LinkedinUrl,
			&i.IsAccountOwner,
			&i.PersonalWebsite,
			&i.CommitmentType,
			&i.Introduction,
			&i.IndustryExperience,
			&i.DetailedBiography,
			&i.PreviousWork,
			&i.ResumeExternalUrl,
			&i.ResumeInternalUrl,
			&i.FoundersAgreementExternalUrl,
			&i.FoundersAgreementInternalUrl,
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
RETURNING id, company_id, first_name, last_name, title, linkedin_url, is_account_owner, personal_website, commitment_type, introduction, industry_experience, detailed_biography, previous_work, resume_external_url, resume_internal_url, founders_agreement_external_url, founders_agreement_internal_url, created_at, updated_at
`

type UpdateTeamMemberParams struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Title       string `json:"title"`
	Bio         string `json:"bio"`
	LinkedinUrl string `json:"linkedin_url"`
	ID          string `json:"id"`
	CompanyID   string `json:"company_id"`
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
		&i.LinkedinUrl,
		&i.IsAccountOwner,
		&i.PersonalWebsite,
		&i.CommitmentType,
		&i.Introduction,
		&i.IndustryExperience,
		&i.DetailedBiography,
		&i.PreviousWork,
		&i.ResumeExternalUrl,
		&i.ResumeInternalUrl,
		&i.FoundersAgreementExternalUrl,
		&i.FoundersAgreementInternalUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateTeamMemberDocuments = `-- name: UpdateTeamMemberDocuments :exec
UPDATE team_members
SET
    resume_internal_url = $1,
    founders_agreement_internal_url = $2
WHERE id = $3 AND company_id = $4
`

type UpdateTeamMemberDocumentsParams struct {
	ResumeInternalUrl            *string `json:"resume_internal_url"`
	FoundersAgreementInternalUrl *string `json:"founders_agreement_internal_url"`
	ID                           string  `json:"id"`
	CompanyID                    string  `json:"company_id"`
}

func (q *Queries) UpdateTeamMemberDocuments(ctx context.Context, arg UpdateTeamMemberDocumentsParams) error {
	_, err := q.db.Exec(ctx, updateTeamMemberDocuments,
		arg.ResumeInternalUrl,
		arg.FoundersAgreementInternalUrl,
		arg.ID,
		arg.CompanyID,
	)
	return err
}
