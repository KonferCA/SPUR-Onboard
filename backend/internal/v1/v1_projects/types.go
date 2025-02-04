package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
)

type Handler struct {
	server interfaces.CoreServer
}

type CreateProjectRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description" validate:"required"`
}

type ProjectResponse struct {
	ID          string           `json:"id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Status      db.ProjectStatus `json:"status"`
	CreatedAt   int64            `json:"created_at"`
	UpdatedAt   int64            `json:"updated_at"`
}

type ExtendedProjectResponse struct {
	ProjectResponse
	CompanyName     string `json:"company_name"`
	DocumentCount   int64  `json:"document_count"`
	TeamMemberCount int64  `json:"team_member_count"`
}

type ProjectAnswerResponse struct {
	ID         string `json:"id"`
	QuestionID string `json:"question_id"`
	Question   string `json:"question"`
	Answer     string `json:"answer"`
	Section    string `json:"section"`
}

type PatchAnswerRequest struct {
	Content  string `json:"content" validate:"required"`
	AnswerID string `json:"answer_id" validate:"required,uuid"`
}

type UploadDocumentRequest struct {
	QuestionID string `form:"question_id" validate:"required,uuid"`
	Name       string `form:"name" validate:"required"`
	Section    string `form:"section" validate:"required"`
	SubSection string `form:"sub_section" validate:"required"`
}

type DocumentResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	URL       string `json:"url"`
	Section   string `json:"section"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

type ValidationResult struct {
	IsValid bool   `json:"is_valid"`
	Level   string `json:"level"` // "error" or "warning"
	Message string `json:"message"`
}

type SubmitProjectRequest struct {
	Answers []AnswerSubmission `json:"answers" validate:"required,dive"`
}

type AnswerSubmission struct {
	QuestionID string `json:"question_id" validate:"required"`
	Answer     string `json:"answer" validate:"required"`
}

type SubmitProjectResponse struct {
	Message string           `json:"message"`
	Status  db.ProjectStatus `json:"status"`
}

// Request Types
type CreateAnswerRequest struct {
	Content    string `json:"content" validate:"required"`
	QuestionID string `json:"question_id" validate:"required,uuid"`
}

type ValidationError struct {
	Question string `json:"question"`
	Message  string `json:"message"`
}

// Response Types
type AnswerResponse struct {
	ID         string `json:"id"`
	ProjectID  string `json:"project_id"`
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type CommentResponse struct {
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

type CommentsResponse struct {
	Comments []CommentResponse `json:"comments"`
}

type CreateCommentRequest struct {
	Comment  string `json:"comment" validate:"required"`
	TargetID string `json:"target_id" validate:"required,uuid"`
}

type UpdateCommentRequest struct {
	Comment string `json:"comment" validate:"required"`
}

type ProjectDraftContent struct {
	QuestionID string `json:"question_id" validate:"required,uuid"`
	// Answer is not validated since its a draft content and it can be wrong
	// It can be a string or array of strings.
	Answer interface{} `json:"answer,omitempty"`
}

type SaveProjectDraftRequest struct {
	Draft []ProjectDraftContent `json:"draft" validate:"required,dive"`
}
