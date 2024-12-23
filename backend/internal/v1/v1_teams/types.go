package v1_teams

import (
	"KonferCA/SPUR/internal/interfaces"
)

type Handler struct {
	server interfaces.CoreServer
}

// Request types
type AddTeamMemberRequest struct {
	FirstName   string `json:"first_name" validate:"required"`
	LastName    string `json:"last_name" validate:"required"`
	Title       string `json:"title" validate:"required"`
	Bio         string `json:"bio" validate:"required"`
	LinkedinUrl string `json:"linkedin_url" validate:"required,url"`
}

type UpdateTeamMemberRequest struct {
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	Title       string `json:"title,omitempty"`
	Bio         string `json:"bio,omitempty"`
	LinkedinUrl string `json:"linkedin_url,omitempty" validate:"omitempty,url"`
}

// Response types
type TeamMemberResponse struct {
	ID             string `json:"id"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	Title          string `json:"title"`
	Bio            string `json:"bio"`
	LinkedinUrl    string `json:"linkedin_url"`
	IsAccountOwner bool   `json:"is_account_owner"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at,omitempty"`
}

type TeamMembersResponse struct {
	TeamMembers []TeamMemberResponse `json:"team_members"`
}
