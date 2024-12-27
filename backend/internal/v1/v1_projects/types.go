package v1_projects

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/db"
)

type Handler struct {
	server interfaces.CoreServer
}

type CreateProjectRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description" validate:"required"`
}

type ProjectResponse struct {
	ID          string         `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      db.ProjectStatus `json:"status"`
	CreatedAt   int64         `json:"created_at"`
	UpdatedAt   int64         `json:"updated_at"`
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
	Name    string `json:"name" validate:"required"`
	Section string `json:"section" validate:"required"`
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