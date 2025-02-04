// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: projects.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
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
	CompanyID   string        `json:"company_id"`
	Title       string        `json:"title"`
	Description *string       `json:"description"`
	Status      ProjectStatus `json:"status"`
	CreatedAt   int64         `json:"created_at"`
	UpdatedAt   int64         `json:"updated_at"`
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
) RETURNING id, project_id, question_id, answer, choices, created_at, updated_at
`

type CreateProjectAnswerParams struct {
	ProjectID  string `json:"project_id"`
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
}

func (q *Queries) CreateProjectAnswer(ctx context.Context, arg CreateProjectAnswerParams) (ProjectAnswer, error) {
	row := q.db.QueryRow(ctx, createProjectAnswer, arg.ProjectID, arg.QuestionID, arg.Answer)
	var i ProjectAnswer
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Answer,
		&i.Choices,
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
RETURNING id, project_id, question_id, answer, choices, created_at, updated_at
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
			&i.Choices,
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
	ProjectID   string `json:"project_id"`
	TargetID    string `json:"target_id"`
	Comment     string `json:"comment"`
	CommenterID string `json:"commenter_id"`
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
    question_id,
    name,
    url,
    section,
    sub_section,
    mime_type,
    size,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1, -- project_id
    $2, -- question_id
    $3, -- name
    $4, -- url
    $5, -- section
    $6, -- sub_section
    $7, -- mime_type
    $8, -- size in bytes
    extract(epoch from now()),
    extract(epoch from now())
) RETURNING id, project_id, question_id, name, url, section, sub_section, mime_type, size, created_at, updated_at
`

type CreateProjectDocumentParams struct {
	ProjectID  string `json:"project_id"`
	QuestionID string `json:"question_id"`
	Name       string `json:"name"`
	Url        string `json:"url"`
	Section    string `json:"section"`
	SubSection string `json:"sub_section"`
	MimeType   string `json:"mime_type"`
	Size       int64  `json:"size"`
}

func (q *Queries) CreateProjectDocument(ctx context.Context, arg CreateProjectDocumentParams) (ProjectDocument, error) {
	row := q.db.QueryRow(ctx, createProjectDocument,
		arg.ProjectID,
		arg.QuestionID,
		arg.Name,
		arg.Url,
		arg.Section,
		arg.SubSection,
		arg.MimeType,
		arg.Size,
	)
	var i ProjectDocument
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Name,
		&i.Url,
		&i.Section,
		&i.SubSection,
		&i.MimeType,
		&i.Size,
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
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	CompanyID string `json:"company_id"`
}

func (q *Queries) DeleteProjectDocument(ctx context.Context, arg DeleteProjectDocumentParams) (string, error) {
	row := q.db.QueryRow(ctx, deleteProjectDocument, arg.ID, arg.ProjectID, arg.CompanyID)
	var id string
	err := row.Scan(&id)
	return id, err
}

const getCompanyByUserID = `-- name: GetCompanyByUserID :one
SELECT id, owner_id, name, description, date_founded, stages, website, wallet_address, linkedin_url, created_at, updated_at FROM companies 
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
		&i.Description,
		&i.DateFounded,
		&i.Stages,
		&i.Website,
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
	AnswerID   string `json:"answer_id"`
	Answer     string `json:"answer"`
	QuestionID string `json:"question_id"`
	Question   string `json:"question"`
	Section    string `json:"section"`
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
WHERE id = $1 
  AND (company_id = $2 OR $3 & 1 = 1) -- Check for PermViewAllProjects (1 << 0)
LIMIT 1
`

type GetProjectByIDParams struct {
	ID        string      `json:"id"`
	CompanyID string      `json:"company_id"`
	Column3   interface{} `json:"column_3"`
}

func (q *Queries) GetProjectByID(ctx context.Context, arg GetProjectByIDParams) (Project, error) {
	row := q.db.QueryRow(ctx, getProjectByID, arg.ID, arg.CompanyID, arg.Column3)
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
SELECT pc.id, pc.project_id, pc.target_id, pc.comment, pc.commenter_id, pc.resolved, pc.created_at, pc.updated_at, u.first_name as commenter_first_name, u.last_name as commenter_last_name FROM project_comments pc
JOIN users u ON u.id = pc.commenter_id
WHERE pc.id = $1 AND pc.project_id = $2
LIMIT 1
`

type GetProjectCommentParams struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}

type GetProjectCommentRow struct {
	ID                 string  `json:"id"`
	ProjectID          string  `json:"project_id"`
	TargetID           string  `json:"target_id"`
	Comment            string  `json:"comment"`
	CommenterID        string  `json:"commenter_id"`
	Resolved           bool    `json:"resolved"`
	CreatedAt          int64   `json:"created_at"`
	UpdatedAt          int64   `json:"updated_at"`
	CommenterFirstName *string `json:"commenter_first_name"`
	CommenterLastName  *string `json:"commenter_last_name"`
}

func (q *Queries) GetProjectComment(ctx context.Context, arg GetProjectCommentParams) (GetProjectCommentRow, error) {
	row := q.db.QueryRow(ctx, getProjectComment, arg.ID, arg.ProjectID)
	var i GetProjectCommentRow
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.TargetID,
		&i.Comment,
		&i.CommenterID,
		&i.Resolved,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.CommenterFirstName,
		&i.CommenterLastName,
	)
	return i, err
}

const getProjectComments = `-- name: GetProjectComments :many
SELECT pc.id, pc.project_id, pc.target_id, pc.comment, pc.commenter_id, pc.resolved, pc.created_at, pc.updated_at, u.first_name as commenter_first_name, u.last_name as commenter_last_name FROM project_comments pc
JOIN users u ON u.id = pc.commenter_id
WHERE pc.project_id = $1
ORDER BY pc.created_at DESC
`

type GetProjectCommentsRow struct {
	ID                 string  `json:"id"`
	ProjectID          string  `json:"project_id"`
	TargetID           string  `json:"target_id"`
	Comment            string  `json:"comment"`
	CommenterID        string  `json:"commenter_id"`
	Resolved           bool    `json:"resolved"`
	CreatedAt          int64   `json:"created_at"`
	UpdatedAt          int64   `json:"updated_at"`
	CommenterFirstName *string `json:"commenter_first_name"`
	CommenterLastName  *string `json:"commenter_last_name"`
}

func (q *Queries) GetProjectComments(ctx context.Context, projectID string) ([]GetProjectCommentsRow, error) {
	rows, err := q.db.Query(ctx, getProjectComments, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetProjectCommentsRow
	for rows.Next() {
		var i GetProjectCommentsRow
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.TargetID,
			&i.Comment,
			&i.CommenterID,
			&i.Resolved,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.CommenterFirstName,
			&i.CommenterLastName,
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

const getProjectCountOwnedByCompany = `-- name: GetProjectCountOwnedByCompany :one
SELECT COUNT(id) FROM projects WHERE company_id = $1
`

func (q *Queries) GetProjectCountOwnedByCompany(ctx context.Context, companyID string) (int64, error) {
	row := q.db.QueryRow(ctx, getProjectCountOwnedByCompany, companyID)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const getProjectDocument = `-- name: GetProjectDocument :one
SELECT project_documents.id, project_documents.project_id, project_documents.question_id, project_documents.name, project_documents.url, project_documents.section, project_documents.sub_section, project_documents.mime_type, project_documents.size, project_documents.created_at, project_documents.updated_at FROM project_documents
JOIN projects ON project_documents.project_id = projects.id
WHERE project_documents.id = $1 
AND project_documents.project_id = $2
AND projects.company_id = $3
`

type GetProjectDocumentParams struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	CompanyID string `json:"company_id"`
}

func (q *Queries) GetProjectDocument(ctx context.Context, arg GetProjectDocumentParams) (ProjectDocument, error) {
	row := q.db.QueryRow(ctx, getProjectDocument, arg.ID, arg.ProjectID, arg.CompanyID)
	var i ProjectDocument
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Name,
		&i.Url,
		&i.Section,
		&i.SubSection,
		&i.MimeType,
		&i.Size,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectDocuments = `-- name: GetProjectDocuments :many
SELECT id, project_id, question_id, name, url, section, sub_section, mime_type, size, created_at, updated_at FROM project_documents
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
			&i.QuestionID,
			&i.Name,
			&i.Url,
			&i.Section,
			&i.SubSection,
			&i.MimeType,
			&i.Size,
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
SELECT id, question, section, sub_section, section_order, sub_section_order, question_order, condition_type, condition_value, dependent_question_id, validations, question_group_id, input_type, options, required, placeholder, description, disabled, created_at, updated_at FROM project_questions
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
		&i.SubSection,
		&i.SectionOrder,
		&i.SubSectionOrder,
		&i.QuestionOrder,
		&i.ConditionType,
		&i.ConditionValue,
		&i.DependentQuestionID,
		&i.Validations,
		&i.QuestionGroupID,
		&i.InputType,
		&i.Options,
		&i.Required,
		&i.Placeholder,
		&i.Description,
		&i.Disabled,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProjectQuestions = `-- name: GetProjectQuestions :many
WITH all_questions AS (
    SELECT 
        pq.id,
        pq.question,
        pq.section,
        pq.sub_section,
        pq.section_order,
        pq.sub_section_order,
        pq.question_order,
        pq.input_type,
        pq.options,
        pq.required,
        pq.validations,
        pq.condition_type,
        pq.condition_value,
        pq.dependent_question_id,
        pq.question_group_id,
        pq.placeholder,
        pq.description,
        pq.disabled,
        '' AS answer, -- these are here to match the query output when fetching QA for a project
        ARRAY[]::text[] as choices -- same here
    FROM project_questions pq
)
SELECT id, question, section, sub_section, section_order, sub_section_order, question_order, input_type, options, required, validations, condition_type, condition_value, dependent_question_id, question_group_id, placeholder, description, disabled, answer, choices FROM all_questions
ORDER BY
    section_order,
    sub_section_order,
    question_order
`

type GetProjectQuestionsRow struct {
	ID                  string                `json:"id"`
	Question            string                `json:"question"`
	Section             string                `json:"section"`
	SubSection          string                `json:"sub_section"`
	SectionOrder        int32                 `json:"section_order"`
	SubSectionOrder     int32                 `json:"sub_section_order"`
	QuestionOrder       int32                 `json:"question_order"`
	InputType           InputTypeEnum         `json:"input_type"`
	Options             []string              `json:"options"`
	Required            bool                  `json:"required"`
	Validations         []string              `json:"validations"`
	ConditionType       NullConditionTypeEnum `json:"condition_type"`
	ConditionValue      *string               `json:"condition_value"`
	DependentQuestionID pgtype.UUID           `json:"dependent_question_id"`
	QuestionGroupID     pgtype.UUID           `json:"question_group_id"`
	Placeholder         *string               `json:"placeholder"`
	Description         *string               `json:"description"`
	Disabled            bool                  `json:"disabled"`
	Answer              string                `json:"answer"`
	Choices             []string              `json:"choices"`
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
			&i.SubSection,
			&i.SectionOrder,
			&i.SubSectionOrder,
			&i.QuestionOrder,
			&i.InputType,
			&i.Options,
			&i.Required,
			&i.Validations,
			&i.ConditionType,
			&i.ConditionValue,
			&i.DependentQuestionID,
			&i.QuestionGroupID,
			&i.Placeholder,
			&i.Description,
			&i.Disabled,
			&i.Answer,
			&i.Choices,
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
SELECT q.id, q.question, q.section, q.sub_section, q.section_order, q.sub_section_order, q.question_order, q.condition_type, q.condition_value, q.dependent_question_id, q.validations, q.question_group_id, q.input_type, q.options, q.required, q.placeholder, q.description, q.disabled, q.created_at, q.updated_at FROM project_questions q
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
		&i.SubSection,
		&i.SectionOrder,
		&i.SubSectionOrder,
		&i.QuestionOrder,
		&i.ConditionType,
		&i.ConditionValue,
		&i.DependentQuestionID,
		&i.Validations,
		&i.QuestionGroupID,
		&i.InputType,
		&i.Options,
		&i.Required,
		&i.Placeholder,
		&i.Description,
		&i.Disabled,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getQuestionsByProject = `-- name: GetQuestionsByProject :many
WITH project_owner_check AS (
   SELECT p.id 
   FROM projects p
   JOIN companies c ON p.company_id = c.id 
   WHERE p.id = $1
   AND c.owner_id = $2
)
SELECT 
    pq.id,
    pq.question,
    pq.section,
    pq.sub_section,
    pq.section_order,
    pq.sub_section_order,
    pq.question_order,
    pq.input_type,
    pq.options,
    pq.required,
    pq.validations,
    pq.condition_type,
    pq.condition_value,
    pq.dependent_question_id,
    pq.question_group_id,
    pq.placeholder,
    pq.description,
    pq.disabled,
    COALESCE(pa.answer, '') AS answer,
    COALESCE(pa.choices, ARRAY[]::text[]) as choices
FROM project_questions pq
LEFT JOIN project_answers pa ON pa.question_id = pq.id 
    AND pa.project_id = $1
WHERE EXISTS (SELECT 1 FROM project_owner_check)
ORDER BY
    pq.section_order,
    pq.sub_section_order,
    pq.question_order
`

type GetQuestionsByProjectParams struct {
	ProjectID string `json:"project_id"`
	OwnerID   string `json:"owner_id"`
}

type GetQuestionsByProjectRow struct {
	ID                  string                `json:"id"`
	Question            string                `json:"question"`
	Section             string                `json:"section"`
	SubSection          string                `json:"sub_section"`
	SectionOrder        int32                 `json:"section_order"`
	SubSectionOrder     int32                 `json:"sub_section_order"`
	QuestionOrder       int32                 `json:"question_order"`
	InputType           InputTypeEnum         `json:"input_type"`
	Options             []string              `json:"options"`
	Required            bool                  `json:"required"`
	Validations         []string              `json:"validations"`
	ConditionType       NullConditionTypeEnum `json:"condition_type"`
	ConditionValue      *string               `json:"condition_value"`
	DependentQuestionID pgtype.UUID           `json:"dependent_question_id"`
	QuestionGroupID     pgtype.UUID           `json:"question_group_id"`
	Placeholder         *string               `json:"placeholder"`
	Description         *string               `json:"description"`
	Disabled            bool                  `json:"disabled"`
	Answer              string                `json:"answer"`
	Choices             []string              `json:"choices"`
}

func (q *Queries) GetQuestionsByProject(ctx context.Context, arg GetQuestionsByProjectParams) ([]GetQuestionsByProjectRow, error) {
	rows, err := q.db.Query(ctx, getQuestionsByProject, arg.ProjectID, arg.OwnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetQuestionsByProjectRow
	for rows.Next() {
		var i GetQuestionsByProjectRow
		if err := rows.Scan(
			&i.ID,
			&i.Question,
			&i.Section,
			&i.SubSection,
			&i.SectionOrder,
			&i.SubSectionOrder,
			&i.QuestionOrder,
			&i.InputType,
			&i.Options,
			&i.Required,
			&i.Validations,
			&i.ConditionType,
			&i.ConditionValue,
			&i.DependentQuestionID,
			&i.QuestionGroupID,
			&i.Placeholder,
			&i.Description,
			&i.Disabled,
			&i.Answer,
			&i.Choices,
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
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
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
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
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
RETURNING id, project_id, question_id, answer, choices, created_at, updated_at
`

type UpdateProjectAnswerParams struct {
	Answer    string `json:"answer"`
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}

func (q *Queries) UpdateProjectAnswer(ctx context.Context, arg UpdateProjectAnswerParams) (ProjectAnswer, error) {
	row := q.db.QueryRow(ctx, updateProjectAnswer, arg.Answer, arg.ID, arg.ProjectID)
	var i ProjectAnswer
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.QuestionID,
		&i.Answer,
		&i.Choices,
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
	ID      string `json:"id"`
	Comment string `json:"comment"`
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
	Status ProjectStatus `json:"status"`
	ID     string        `json:"id"`
}

func (q *Queries) UpdateProjectStatus(ctx context.Context, arg UpdateProjectStatusParams) error {
	_, err := q.db.Exec(ctx, updateProjectStatus, arg.Status, arg.ID)
	return err
}
