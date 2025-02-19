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
	ID                string  `json:"id"`
	FirstName         string  `json:"first_name"`
	LastName          string  `json:"last_name"`
	Title             string  `json:"title"`
	Bio               string  `json:"bio"`
	LinkedIn          string  `json:"linkedin_url"`
	ProfilePictureUrl *string `json:"profile_picture_url"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         *string `json:"updated_at,omitempty"`
}

type ListUsersRequest struct {
	Role      string `query:"role"`
	Search    string `query:"search"`
	SortOrder string `query:"sort_order" validate:"omitempty,oneof=asc desc"`
	Page      int    `query:"page" validate:"min=1"`
	Limit     int    `query:"limit" validate:"min=1,max=100"`
}

type ListUsersResponse struct {
	Users []UserResponse `json:"users"`
	Total int64         `json:"total"`
}

type UserResponse struct {
	ID            string  `json:"id"`
	FirstName     string  `json:"first_name"`
	LastName      string  `json:"last_name"`
	Email         string  `json:"email"`
	Role          string  `json:"role"`
	Permissions   uint32  `json:"permissions"`
	DateJoined    string  `json:"date_joined"`
	EmailVerified bool    `json:"email_verified"`
	UpdatedAt     *string `json:"updated_at"`
}

type UpdateUserRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin investor regular"`
}

type UpdateUsersRoleRequest struct {
	UserIDs []string `json:"user_ids" validate:"required,min=1,dive,required"`
	Role    string   `json:"role" validate:"required,oneof=admin investor regular"`
}

type UploadProfilePictureResponse struct {
	URL string `json:"url"`
}
