package server

import (
	"time"

	"github.com/KonferCA/NoKap/db"
)

// TODO: Reorder types
// What is the criteria of the ordering? - Juan

type DatabaseInfo struct {
	Connected       bool    `json:"connected"`
	LatencyMs       float64 `json:"latency_ms"`
	PostgresVersion string  `json:"postgres_version,omitempty"`
	Error           string  `json:"error,omitempty"`
}

type SystemInfo struct {
	Version      string  `json:"version"`
	GoVersion    string  `json:"go_version"`
	NumGoRoutine int     `json:"num_goroutines"`
	MemoryUsage  float64 `json:"memory_usage"`
}

type HealthReport struct {
	Status    string       `json:"status"`
	Timestamp time.Time    `json:"timestamp"`
	Database  DatabaseInfo `json:"database"`
	System    SystemInfo   `json:"system"`
}

type CreateCompanyRequest struct {
	OwnerUserID string  `json:"owner_user_id" validate:"required,uuid"`
	Name        string  `json:"name" validate:"required"`
	Description *string `json:"description"`
}

type CreateResourceRequestRequest struct {
	CompanyID    string  `json:"company_id" validate:"required,uuid"`
	ResourceType string  `json:"resource_type" validate:"required"`
	Description  *string `json:"description"`
	Status       string  `json:"status" validate:"required"`
}

type SignupRequest struct {
	Email     string      `json:"email" validate:"required,email"`
	Password  string      `json:"password" validate:"required,min=8"`
	FirstName string      `json:"first_name" validate:"required"`
	LastName  string      `json:"last_name" validate:"required"`
	Role      db.UserRole `json:"role" validate:"required,valid_user_role"`
}

type SigninRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

type User struct {
	ID            string      `json:"id"`
	Email         string      `json:"email"`
	FirstName     string      `json:"first_name"`
	LastName      string      `json:"last_name"`
	Role          db.UserRole `json:"role"`
	WalletAddress *string     `json:"wallet_address,omitempty"`
}

type CreateCompanyFinancialsRequest struct {
	FinancialYear  int32   `json:"financial_year" validate:"required"`
	Revenue        float64 `json:"revenue" validate:"required"`
	Expenses       float64 `json:"expenses" validate:"required"`
	Profit         float64 `json:"profit" validate:"required"`
	Sales          float64 `json:"sales" validate:"required"`
	AmountRaised   float64 `json:"amount_raised" validate:"required"`
	ARR            float64 `json:"arr" validate:"required"`
	GrantsReceived float64 `json:"grants_received" validate:"required"`
}

type CreateEmployeeRequest struct {
	CompanyID string  `json:"company_id" validate:"required,uuid"`
	Name      string  `json:"name" validate:"required"`
	Email     string  `json:"email" validate:"required,email"`
	Role      string  `json:"role" validate:"required"`
	Bio       *string `json:"bio"`
}

type UpdateEmployeeRequest struct {
	Name string  `json:"name" validate:"required"`
	Role string  `json:"role" validate:"required"`
	Bio  *string `json:"bio"`
}

type CreateCompanyDocumentRequest struct {
	CompanyID    string `json:"company_id" validate:"required,uuid"`
	DocumentType string `json:"document_type" validate:"required"`
	FileURL      string `json:"file_url" validate:"required,url"`
}

type UpdateCompanyDocumentRequest struct {
	DocumentType string `json:"document_type" validate:"required"`
	FileURL      string `json:"file_url" validate:"required,url"`
}

type CreateQuestionRequest struct {
	QuestionText string `json:"question_text" validate:"required"`
}

type CreateCompanyAnswerRequest struct {
	QuestionID string `json:"question_id" validate:"required,uuid"`
	AnswerText string `json:"answer_text" validate:"required"`
}

type UpdateCompanyAnswerRequest struct {
	AnswerText string `json:"answer_text" validate:"required"`
}

type CreateProjectRequest struct {
	CompanyID   string  `json:"company_id" validate:"required"`
	Title       string  `json:"title" validate:"required"`
	Description *string `json:"description"`
	Status      string  `json:"status" validate:"required"`
}

type UpdateProjectRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	Status      string `json:"status" validate:"required"`
}

type CreateProjectFileRequest struct {
	FileType string `json:"file_type" validate:"required"`
	FileURL  string `json:"file_url" validate:"required,url"`
}

type CreateProjectCommentRequest struct {
	UserID  string `json:"user_id" validate:"required"`
	Comment string `json:"comment" validate:"required"`
}

type CreateProjectLinkRequest struct {
	LinkType string `json:"link_type" validate:"required"`
	URL      string `json:"url" validate:"required,url"`
}

type AddProjectTagRequest struct {
	TagID string `json:"tag_id" validate:"required,uuid"`
}

type CreateTagRequest struct {
	Name string `json:"name" validate:"required"`
}

type CreateFundingTransactionRequest struct {
	ProjectID         string `json:"project_id" validate:"required,uuid"`
	Amount            string `json:"amount" validate:"required"`
	Currency          string `json:"currency" validate:"required,len=3"`
	TransactionHash   string `json:"transaction_hash" validate:"required"`
	FromWalletAddress string `json:"from_wallet_address" validate:"required"`
	ToWalletAddress   string `json:"to_wallet_address" validate:"required"`
	Status            string `json:"status" validate:"required,oneof=PENDING COMPLETED FAILED"`
}

type UpdateFundingTransactionStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=PENDING COMPLETED FAILED"`
}

type CreateMeetingRequest struct {
	ProjectID         string  `json:"project_id" validate:"required,uuid"`
	ScheduledByUserID string  `json:"scheduled_by_user_id" validate:"required,uuid"`
	StartTime         string  `json:"start_time" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
	EndTime           string  `json:"end_time" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
	MeetingURL        *string `json:"meeting_url" validate:"omitempty,url"`
	Location          *string `json:"location"`
	Notes             *string `json:"notes"`
}

type UpdateMeetingRequest struct {
	StartTime  string  `json:"start_time" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
	EndTime    string  `json:"end_time" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
	MeetingURL *string `json:"meeting_url" validate:"omitempty,url"`
	Location   *string `json:"location"`
	Notes      *string `json:"notes"`
}
