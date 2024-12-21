package v1_auth

import "KonferCA/SPUR/internal/interfaces"

/*
Main Handler struct for V1 auth routes.
*/
type Handler struct {
	server interfaces.CoreServer
}

/*
Response body for route /auth/ami-verified and /auth/verify-email
*/
type EmailVerifiedStatusResponse struct {
	Verified bool `json:"verified"`
}

/*
Request body for route /auth/register
*/
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}
