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
 * Request/response types for authentication endpoints.
 * These define the API contract for auth-related operations.
 */
type AuthRequest struct {
	Email    string `json:"email" validate:"required,email"`    // user's email
	Password string `json:"password" validate:"required,min=8"` // user's password
}

type AuthResponse struct {
	AccessToken string       `json:"access_token"` // jwt access token
	CompanyId   *string      `json:"company_id"`
	User        UserResponse `json:"user"` // user info
}

type UserResponse struct {
	ID                string  `json:"id"`
	FirstName         *string `json:"first_name"`
	LastName          *string `json:"last_name"`
	Email             string  `json:"email"`
	EmailVerified     bool    `json:"email_verified"`
	Permissions       uint32  `json:"permissions"`
	ProfilePictureUrl *string `json:"profile_picture_url"`
}
