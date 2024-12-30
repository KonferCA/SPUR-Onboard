package v1_companies

import "KonferCA/SPUR/internal/interfaces"

/*
Main Handler struct for V1 auth routes.
*/
type Handler struct {
	server interfaces.CoreServer
}

type CreateCompanyRequest struct {
	Name          string `json:"name" validate:"required,min=1,max=255"`
	WalletAddress string `json:"wallet_address,omitempty" validate:"omitempty,wallet_address"`
	LinkedinURL   string `json:"linkedin_url" validate:"required,linkedin_url"`
}

type UpdateCompanyRequest struct {
	Name          string `json:"name,omitempty" validate:"omitempty,min=1,max=255"`
	WalletAddress string `json:"wallet_address,omitempty" validate:"omitempty,wallet_address"`
	LinkedinURL   string `json:"linkedin_url,omitempty" validate:"omitempty,linkedin_url"`
}

type CompanyResponse struct {
	ID            string  `json:"id"`
	OwnerID       string  `json:"owner_id"`
	Name          string  `json:"name"`
	WalletAddress *string `json:"wallet_address,omitempty"`
	LinkedinURL   string  `json:"linkedin_url"`
	CreatedAt     int64   `json:"created_at"`
	UpdatedAt     int64   `json:"updated_at"`
}

type CompaniesResponse struct {
	Companies []CompanyResponse `json:"companies"`
}
