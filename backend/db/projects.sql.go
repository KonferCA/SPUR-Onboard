// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: projects.sql

package db

import (
	"context"
)

const createProject = `-- name: CreateProject :one
INSERT INTO projects (
    company_id,
    title,
    description,
    status,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING id, company_id, title, description, status, created_at, updated_at
`

type CreateProjectParams struct {
	CompanyID   string
	Title       string
	Description *string
	Status      ProjectStatus
	CreatedAt   int64
	UpdatedAt   int64
}

func (q *Queries) CreateProject(ctx context.Context, arg CreateProjectParams) (Project, error) {
	row := q.db.QueryRow(ctx, createProject,
		arg.CompanyID,
		arg.Title,
		arg.Description,
		arg.Status,
		arg.CreatedAt,
		arg.UpdatedAt,
	)
	var i Project
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.Title,
		&i.Description,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const createProjectAnswer = `-- name: CreateProjectAnswer :one
INSERT INTO project_answers (
    project_id,
    question_id,
    answer
) VALUES (
    $1, -- project_id
    $2, -- question_id
    $3  -- answer
) RETURNING id, project_id, question_id, answer, created_at, updated_at
`

type CreateProjectAnswerParams struct {
	ProjectID  string
	QuestionID string
	Answer     string
}

func (q *Queries) CreateProjectAnswer(ctx context.Context, arg CreateProjectAnswerParams) (ProjectAnswer, error) {
	row := q.db.QueryRow(ctx, createProjectAnswer, arg.ProjectID, arg.QuestionID, arg.Answer)
	var i ProjectAnswer
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Answer,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const createProjectAnswers = `-- name: CreateProjectAnswers :many
INSERT INTO project_answers (id, project_id, question_id, answer)
SELECT 
    gen_random_uuid(),
    $1,  -- project_id
    pq.id,
    ''   -- empty default answer
FROM project_questions pq
RETURNING id, project_id, question_id, answer, created_at, updated_at
`

func (q *Queries) CreateProjectAnswers(ctx context.Context, projectID string) ([]ProjectAnswer, error) {
	rows, err := q.db.Query(ctx, createProjectAnswers, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ProjectAnswer
	for rows.Next() {
		var i ProjectAnswer
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.QuestionID,
			&i.Answer,
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

const createProjectComment = `-- name: CreateProjectComment :one
INSERT INTO project_comments (
    project_id,
    target_id,
    comment,
    commenter_id
) VALUES (
    $1, -- project_id
    $2, -- target_id
    $3, -- comment
    $4  -- commenter_id
) RETURNING id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at
`

type CreateProjectCommentParams struct {
	ProjectID   string
	TargetID    string
	Comment     string
	CommenterID string
}

func (q *Queries) CreateProjectComment(ctx context.Context, arg CreateProjectCommentParams) (ProjectComment, error) {
	row := q.db.QueryRow(ctx, createProjectComment,
		arg.ProjectID,
		arg.TargetID,
		arg.Comment,
		arg.CommenterID,
	)
	var i ProjectComment
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const createProjectDocument = `-- name: CreateProjectDocument :one
INSERT INTO project_documents (
    id,
    project_id,
    name,
    url,
    section,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, -- project_id
    $2, -- name
    $3, -- url
    $4, -- section
    extract(epoch from now()),
    extract(epoch from now())
) RETURNING id, project_id, name, url, section, created_at, updated_at
`

type CreateProjectDocumentParams struct {
	ProjectID string
	Name      string
	Url       string
	Section   string
}

func (q *Queries) CreateProjectDocument(ctx context.Context, arg CreateProjectDocumentParams) (ProjectDocument, error) {
	row := q.db.QueryRow(ctx, createProjectDocument,
		arg.ProjectID,
		arg.Name,
		arg.Url,
		arg.Section,
	)
	var i ProjectDocument
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.Name,
		&i.Url,
		&i.Section,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteProjectComment = `-- name: DeleteProjectComment :exec
DELETE FROM project_comments
WHERE id = $1
`

func (q *Queries) DeleteProjectComment(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteProjectComment, id)
	return err
}

const deleteProjectDocument = `-- name: DeleteProjectDocument :one
DELETE FROM project_documents 
WHERE project_documents.id = $1 
AND project_documents.project_id = $2 
AND project_documents.project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.company_id = $3
)
RETURNING id
`

type DeleteProjectDocumentParams struct {
	ID        string
	ProjectID string
	CompanyID string
}

func (q *Queries) DeleteProjectDocument(ctx context.Context, arg DeleteProjectDocumentParams) (string, error) {
	row := q.db.QueryRow(ctx, deleteProjectDocument, arg.ID, arg.ProjectID, arg.CompanyID)
	var id string
	err := row.Scan(&id)
	return id, err
}

const getCompanyByUserID = `-- name: GetCompanyByUserID :one
SELECT id, owner_id, name, wallet_address, linkedin_url, created_at, updated_at FROM companies 
WHERE owner_id = $1 
LIMIT 1
`

func (q *Queries) GetCompanyByUserID(ctx context.Context, ownerID string) (Company, error) {
	row := q.db.QueryRow(ctx, getCompanyByUserID, ownerID)
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

const getProjectAnswers = `-- name: GetProjectAnswers :many
SELECT 
    pa.id as answer_id,
    pa.answer,
    pq.id as question_id,
    pq.question,
    pq.section
FROM project_answers pa
JOIN project_questions pq ON pa.question_id = pq.id
WHERE pa.project_id = $1
ORDER BY pq.section, pq.id
`

type GetProjectAnswersRow struct {
	AnswerID   string
	Answer     string
	QuestionID string
	Question   string
	Section    string
}

func (q *Queries) GetProjectAnswers(ctx context.Context, projectID string) ([]GetProjectAnswersRow, error) {
	rows, err := q.db.Query(ctx, getProjectAnswers, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetProjectAnswersRow
	for rows.Next() {
		var i GetProjectAnswersRow
		if err := rows.Scan(
			&i.AnswerID,
			&i.Answer,
			&i.QuestionID,
			&i.Question,
			&i.Section,
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

const getProjectByID = `-- name: GetProjectByID :one
SELECT id, company_id, title, description, status, created_at, updated_at FROM projects 
WHERE id = $1 AND company_id = $2 
LIMIT 1
`

type GetProjectByIDParams struct {
	ID        string
	CompanyID string
}

func (q *Queries) GetProjectByID(ctx context.Context, arg GetProjectByIDParams) (Project, error) {
	row := q.db.QueryRow(ctx, getProjectByID, arg.ID, arg.CompanyID)
	var i Project
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.Title,
		&i.Description,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectByIDAdmin = `-- name: GetProjectByIDAdmin :one
SELECT id, company_id, title, description, status, created_at, updated_at FROM projects 
WHERE id = $1 
LIMIT 1
`

func (q *Queries) GetProjectByIDAdmin(ctx context.Context, id string) (Project, error) {
	row := q.db.QueryRow(ctx, getProjectByIDAdmin, id)
	var i Project
	err := row.Scan(
		&i.ID,
		&i.CompanyID,
		&i.Title,
		&i.Description,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectComment = `-- name: GetProjectComment :one
SELECT id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at FROM project_comments
WHERE id = $1 AND project_id = $2
LIMIT 1
`

type GetProjectCommentParams struct {
	ID        string
	ProjectID string
}

func (q *Queries) GetProjectComment(ctx context.Context, arg GetProjectCommentParams) (ProjectComment, error) {
	row := q.db.QueryRow(ctx, getProjectComment, arg.ID, arg.ProjectID)
	var i ProjectComment
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectComments = `-- name: GetProjectComments :many
SELECT id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at FROM project_comments
WHERE project_id = $1
ORDER BY created_at DESC
`

func (q *Queries) GetProjectComments(ctx context.Context, projectID string) ([]ProjectComment, error) {
	rows, err := q.db.Query(ctx, getProjectComments, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ProjectComment
	for rows.Next() {
		var i ProjectComment
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.TargetID,
			&i.Comment,
			&i.CommenterID,
			&i.Resolved,
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

const getProjectDocument = `-- name: GetProjectDocument :one
SELECT project_documents.id, project_documents.project_id, project_documents.name, project_documents.url, project_documents.section, project_documents.created_at, project_documents.updated_at FROM project_documents
JOIN projects ON project_documents.project_id = projects.id
WHERE project_documents.id = $1 
AND project_documents.project_id = $2
AND projects.company_id = $3
`

type GetProjectDocumentParams struct {
	ID        string
	ProjectID string
	CompanyID string
}

func (q *Queries) GetProjectDocument(ctx context.Context, arg GetProjectDocumentParams) (ProjectDocument, error) {
	row := q.db.QueryRow(ctx, getProjectDocument, arg.ID, arg.ProjectID, arg.CompanyID)
	var i ProjectDocument
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.Name,
		&i.Url,
		&i.Section,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectDocuments = `-- name: GetProjectDocuments :many
SELECT id, project_id, name, url, section, created_at, updated_at FROM project_documents
WHERE project_id = $1
ORDER BY created_at DESC
`

func (q *Queries) GetProjectDocuments(ctx context.Context, projectID string) ([]ProjectDocument, error) {
	rows, err := q.db.Query(ctx, getProjectDocuments, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ProjectDocument
	for rows.Next() {
		var i ProjectDocument
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.Name,
			&i.Url,
			&i.Section,
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

const getProjectQuestion = `-- name: GetProjectQuestion :one
SELECT id, question, section, required, validations, created_at, updated_at FROM project_questions 
WHERE id = $1 
LIMIT 1
`

func (q *Queries) GetProjectQuestion(ctx context.Context, id string) (ProjectQuestion, error) {
	row := q.db.QueryRow(ctx, getProjectQuestion, id)
	var i ProjectQuestion
	err := row.Scan(
		&i.ID,
		&i.Question,
		&i.Section,
		&i.Required,
		&i.Validations,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectQuestions = `-- name: GetProjectQuestions :many
SELECT id, question, section, required, validations FROM project_questions
`

type GetProjectQuestionsRow struct {
	ID          string
	Question    string
	Section     string
	Required    bool
	Validations *string
}

func (q *Queries) GetProjectQuestions(ctx context.Context) ([]GetProjectQuestionsRow, error) {
	rows, err := q.db.Query(ctx, getProjectQuestions)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetProjectQuestionsRow
	for rows.Next() {
		var i GetProjectQuestionsRow
		if err := rows.Scan(
			&i.ID,
			&i.Question,
			&i.Section,
			&i.Required,
			&i.Validations,
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

const getProjectsByCompanyID = `-- name: GetProjectsByCompanyID :many
SELECT id, company_id, title, description, status, created_at, updated_at FROM projects 
WHERE company_id = $1 
ORDER BY created_at DESC
`

func (q *Queries) GetProjectsByCompanyID(ctx context.Context, companyID string) ([]Project, error) {
	rows, err := q.db.Query(ctx, getProjectsByCompanyID, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Project
	for rows.Next() {
		var i Project
		if err := rows.Scan(
			&i.ID,
			&i.CompanyID,
			&i.Title,
			&i.Description,
			&i.Status,
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

const getQuestionByAnswerID = `-- name: GetQuestionByAnswerID :one
SELECT q.id, q.question, q.section, q.required, q.validations, q.created_at, q.updated_at FROM project_questions q
JOIN project_answers a ON a.question_id = q.id
WHERE a.id = $1
`

func (q *Queries) GetQuestionByAnswerID(ctx context.Context, id string) (ProjectQuestion, error) {
	row := q.db.QueryRow(ctx, getQuestionByAnswerID, id)
	var i ProjectQuestion
	err := row.Scan(
		&i.ID,
		&i.Question,
		&i.Section,
		&i.Required,
		&i.Validations,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listCompanyProjects = `-- name: ListCompanyProjects :many
SELECT projects.id, projects.company_id, projects.title, projects.description, projects.status, projects.created_at, projects.updated_at FROM projects
WHERE company_id = $1
ORDER BY created_at DESC
`

func (q *Queries) ListCompanyProjects(ctx context.Context, companyID string) ([]Project, error) {
	rows, err := q.db.Query(ctx, listCompanyProjects, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Project
	for rows.Next() {
		var i Project
		if err := rows.Scan(
			&i.ID,
			&i.CompanyID,
			&i.Title,
			&i.Description,
			&i.Status,
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

const resolveProjectComment = `-- name: ResolveProjectComment :one
UPDATE project_comments
SET 
    resolved = true,
    updated_at = extract(epoch from now())
WHERE id = $1 AND project_id = $2
RETURNING id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at
`

type ResolveProjectCommentParams struct {
	ID        string
	ProjectID string
}

func (q *Queries) ResolveProjectComment(ctx context.Context, arg ResolveProjectCommentParams) (ProjectComment, error) {
	row := q.db.QueryRow(ctx, resolveProjectComment, arg.ID, arg.ProjectID)
	var i ProjectComment
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const unresolveProjectComment = `-- name: UnresolveProjectComment :one
UPDATE project_comments
SET 
    resolved = false,
    updated_at = extract(epoch from now())
WHERE id = $1 AND project_id = $2
RETURNING id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at
`

type UnresolveProjectCommentParams struct {
	ID        string
	ProjectID string
}

func (q *Queries) UnresolveProjectComment(ctx context.Context, arg UnresolveProjectCommentParams) (ProjectComment, error) {
	row := q.db.QueryRow(ctx, unresolveProjectComment, arg.ID, arg.ProjectID)
	var i ProjectComment
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateProjectAnswer = `-- name: UpdateProjectAnswer :one
UPDATE project_answers 
SET 
    answer = $1,
    updated_at = extract(epoch from now())
WHERE 
    project_answers.id = $2 
    AND project_id = $3
RETURNING id, project_id, question_id, answer, created_at, updated_at
`

type UpdateProjectAnswerParams struct {
	Answer    string
	ID        string
	ProjectID string
}

func (q *Queries) UpdateProjectAnswer(ctx context.Context, arg UpdateProjectAnswerParams) (ProjectAnswer, error) {
	row := q.db.QueryRow(ctx, updateProjectAnswer, arg.Answer, arg.ID, arg.ProjectID)
	var i ProjectAnswer
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Answer,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateProjectComment = `-- name: UpdateProjectComment :one
UPDATE project_comments
SET comment = $2,
    updated_at = extract(epoch from now())
WHERE id = $1
RETURNING id, project_id, target_id, comment, commenter_id, resolved, created_at, updated_at
`

type UpdateProjectCommentParams struct {
	ID      string
	Comment string
}

func (q *Queries) UpdateProjectComment(ctx context.Context, arg UpdateProjectCommentParams) (ProjectComment, error) {
	row := q.db.QueryRow(ctx, updateProjectComment, arg.ID, arg.Comment)
	var i ProjectComment
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateProjectStatus = `-- name: UpdateProjectStatus :exec
UPDATE projects 
SET 
    status = $1,
    updated_at = extract(epoch from now())
WHERE id = $2
`

type UpdateProjectStatusParams struct {
	Status ProjectStatus
	ID     string
}

func (q *Queries) UpdateProjectStatus(ctx context.Context, arg UpdateProjectStatusParams) error {
	_, err := q.db.Exec(ctx, updateProjectStatus, arg.Status, arg.ID)
	return err
}
