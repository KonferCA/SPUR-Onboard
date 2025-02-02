package v1_companies

import "KonferCA/SPUR/internal/interfaces"

/*
Main Handler struct for V1 auth routes.
*/
type Handler struct {
	server interfaces.CoreServer
}

/*
CreateCompanyRequest represents the request body for creating a new company.
*/
type CreateCompanyRequest struct {
	Name          string   `json:"name" validate:"required,min=1,max=255"`
	Description   string   `json:"description"`
	DateFounded   int64    `json:"date_founded" validate:"required"`
	Stages        []string `json:"stages" validate:"required,min=1"`
	Website       string   `json:"website,omitempty" validate:"omitempty,url"`
	WalletAddress string   `json:"wallet_address,omitempty" validate:"omitempty,wallet_address"`
	LinkedinURL   string   `json:"linkedin_url" validate:"required,linkedin_url"`
}

/*
UpdateCompanyRequest represents the request body for updating a company.
*/
type UpdateCompanyRequest struct {
	Name          string   `json:"name,omitempty" validate:"omitempty,min=1,max=255"`
	Description   string   `json:"description,omitempty"`
	DateFounded   *int64   `json:"date_founded,omitempty"`
	Stages        []string `json:"stages,omitempty"`
	Website       string   `json:"website,omitempty" validate:"omitempty,url"`
	WalletAddress string   `json:"wallet_address,omitempty" validate:"omitempty,wallet_address"`
	LinkedinURL   string   `json:"linkedin_url,omitempty" validate:"omitempty,linkedin_url"`
}

/*
CompanyResponse represents the response body for a company.
*/
type CompanyResponse struct {
	ID            string   `json:"id"`
	OwnerID       string   `json:"owner_id"`
	Name          string   `json:"name"`
	Description   *string  `json:"description,omitempty"`
	DateFounded   int64    `json:"date_founded"`
	Stages        []string `json:"stages"`
	Website       *string  `json:"website,omitempty"`
	WalletAddress *string  `json:"wallet_address,omitempty"`
	LinkedinURL   string   `json:"linkedin_url"`
	CreatedAt     int64    `json:"created_at"`
	UpdatedAt     int64    `json:"updated_at"`
}

/*
CompaniesResponse represents the response body for a list of companies.
*/
type CompaniesResponse struct {
	Companies []CompanyResponse `json:"companies"`
}
