package v1_users

import "KonferCA/SPUR/internal/interfaces"

type Handler struct {
	server interfaces.CoreServer
}

type UpdateUserDetailsRequest struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Title     string `json:"title" validate:"required"`
	Bio       string `json:"bio" validate:"required"`
	LinkedIn  string `json:"linkedin" validate:"required,url"`
}

type UserDetailsResponse struct {
	ID        string  `json:"id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Title     string  `json:"title"`
	Bio       string  `json:"bio"`
	LinkedIn  string  `json:"linkedin_url"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt *string `json:"updated_at,omitempty"`
}
