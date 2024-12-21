package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/interfaces"
)

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

/*
 * Request/response types for authentication endpoints.
 * These define the API contract for auth-related operations.
 */
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`    // user's email
	Password string `json:"password" validate:"required,min=8"` // user's password
}

type LoginResponse struct {
	AccessToken string       `json:"access_token"` // jwt access token
	User        UserResponse `json:"user"`         // user info
}

type UserResponse struct {
	Email         string      `json:"email"`
	EmailVerified bool        `json:"email_verified"`
	Role          db.UserRole `json:"role"`
}
