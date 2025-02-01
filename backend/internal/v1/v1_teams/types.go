package v1_teams

import (
	"KonferCA/SPUR/internal/interfaces"
)

type Handler struct {
	server interfaces.CoreServer
}

// Request types
type AddTeamMemberRequest struct {
	FirstName          string  `json:"first_name" validate:"required"`
	LastName           string  `json:"last_name" validate:"required"`
	Title              string  `json:"title" validate:"required"`
	LinkedinUrl        string  `json:"linkedin_url" validate:"required,url"`
	IsAccountOwner     bool    `json:"is_account_owner" validate:"boolean"`
	PersonalWebsite    *string `json:"personal_website" validate:"required,url"`
	CommitmentType     string  `json:"commitment_type" validate:"required"`
	Introduction       string  `json:"introduction" validate:"required"`
	IndustryExperience string  `json:"industry_experience" validate:"required"`
	DetailedBiography  string  `json:"detailed_biography" validate:"required"`
	PreviousWork       *string `json:"previous_work"`

	// These fields have to be validated in the handler because
	// one of the two being defined makes the input valid
	ResumeExternalUrl            *string `json:"resume_external_url"`
	ResumeInternalUrl            *string `json:"resume_internal_url"`
	FoundersAgreementExternalUrl *string `json:"founders_agreement_external_url"`
	FoundersAgreementInternalUrl *string `json:"founders_agreement_internal_url"`
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
