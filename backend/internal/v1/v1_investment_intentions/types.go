package v1_investment_intentions

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
)

type Handler struct {
	server interfaces.CoreServer
}

type CreateInvestmentIntentionRequest struct {
	ProjectID      string `json:"project_id" validate:"required,uuid4"`
	IntendedAmount string `json:"intended_amount" validate:"required,numeric"`
}

type UpdateInvestmentIntentionRequest struct {
	IntendedAmount string `json:"intended_amount,omitempty" validate:"omitempty,numeric"`
}

type UpdateInvestmentIntentionStatusRequest struct {
	Status          string  `json:"status" validate:"required,oneof=committed waiting_for_transfer transferred_to_spur transferred_to_company"`
	TransactionHash *string `json:"transaction_hash,omitempty"`
}

type InvestmentIntentionResponse struct {
	ID                string              `json:"id"`
	ProjectID         string              `json:"project_id"`
	InvestorID        string              `json:"investor_id"`
	IntendedAmount    string              `json:"intended_amount"`
	Status            db.InvestmentStatus `json:"status"`
	TransactionHash   *string             `json:"transaction_hash"`
	CreatedAt         int64               `json:"created_at"`
	UpdatedAt         int64               `json:"updated_at"`
	InvestorFirstName *string             `json:"investor_first_name,omitempty"`
	InvestorLastName  *string             `json:"investor_last_name,omitempty"`
	InvestorEmail     *string             `json:"investor_email,omitempty"`
	ProjectTitle      *string             `json:"project_title,omitempty"`
	CompanyName       *string             `json:"company_name,omitempty"`
}

type ListInvestmentIntentionsRequest struct {
	ProjectID  string `query:"project_id" validate:"omitempty,uuid4"`
	InvestorID string `query:"investor_id" validate:"omitempty,uuid4"`
	Status     string `query:"status" validate:"omitempty,oneof=committed waiting_for_transfer transferred_to_spur transferred_to_company"`
}

type InvestmentIntentionsListResponse struct {
	InvestmentIntentions []InvestmentIntentionResponse `json:"investment_intentions"`
	Total                int                           `json:"total"`
}

type ProjectInvestmentSummaryResponse struct {
	TotalAmount string `json:"total_amount"`
	TotalCount  int64  `json:"total_count"`
}
