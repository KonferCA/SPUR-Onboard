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
