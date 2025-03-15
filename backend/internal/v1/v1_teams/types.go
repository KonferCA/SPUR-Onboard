package v1_teams

import (
	"KonferCA/SPUR/internal/interfaces"
	"KonferCA/SPUR/internal/v1/v1_common"
)

type Handler struct {
	server interfaces.CoreServer
}

// Request types
type AddTeamMemberRequest struct {
	FirstName          string                 `json:"first_name" validate:"required"`
	LastName           string                 `json:"last_name" validate:"required"`
	Title              string                 `json:"title" validate:"required"`
	LinkedinUrl        string                 `json:"linkedin_url" validate:"omitempty"`
	SocialLinks        []v1_common.SocialLink `json:"social_links"`
	PersonalWebsite    *string                `json:"personal_website" validate:"omitempty,url"`
	IsAccountOwner     bool                   `json:"is_account_owner" validate:"boolean"`
	CommitmentType     string                 `json:"commitment_type" validate:"required"`
	Introduction       string                 `json:"introduction" validate:"required"`
	IndustryExperience string                 `json:"industry_experience"`
	DetailedBiography  string                 `json:"detailed_biography" validate:"required"`
	PreviousWork       *string                `json:"previous_work"`

	// These fields have to be validated in the handler because
	// one of the two being defined makes the input valid
	ResumeExternalUrl            *string `json:"resume_external_url"`
	ResumeInternalUrl            *string `json:"resume_internal_url"`
	FoundersAgreementExternalUrl *string `json:"founders_agreement_external_url"`
	FoundersAgreementInternalUrl *string `json:"founders_agreement_internal_url"`
}

type UpdateTeamMemberRequest struct {
	FirstName                    string                 `json:"first_name,omitempty"`
	LastName                     string                 `json:"last_name,omitempty"`
	Title                        string                 `json:"title,omitempty"`
	DetailedBiography            string                 `json:"detailed_biography,omitempty"`
	LinkedinUrl                  string                 `json:"linkedin_url,omitempty" validate:"omitempty"`
	SocialLinks                  []v1_common.SocialLink `json:"social_links,omitempty"`
	PersonalWebsite              *string                `json:"personal_website,omitempty" validate:"omitempty,url"`
	CommitmentType               string                 `json:"commitment_type,omitempty"`
	Introduction                 string                 `json:"introduction,omitempty"`
	IndustryExperience           string                 `json:"industry_experience,omitempty"`
	PreviousWork                 *string                `json:"previous_work,omitempty"`
	ResumeExternalUrl            *string                `json:"resume_external_url,omitempty"`
	ResumeInternalUrl            *string                `json:"resume_internal_url,omitempty"`
	FoundersAgreementExternalUrl *string                `json:"founders_agreement_external_url,omitempty"`
	FoundersAgreementInternalUrl *string                `json:"founders_agreement_internal_url,omitempty"`
}

type UploadTeamMemberDocumentResponse struct {
	Url string `json:"url"`
}

// Response types
type TeamMemberResponse struct {
	ID                           string                 `json:"id"`
	CompanyID                    string                 `json:"company_id"`
	FirstName                    string                 `json:"first_name"`
	LastName                     string                 `json:"last_name"`
	Title                        string                 `json:"title"`
	SocialLinks                  []v1_common.SocialLink `json:"social_links"`
	IsAccountOwner               bool                   `json:"is_account_owner"`
	CommitmentType               string                 `json:"commitment_type"`
	Introduction                 string                 `json:"introduction"`
	IndustryExperience           string                 `json:"industry_experience"`
	DetailedBiography            string                 `json:"detailed_biography"`
	PreviousWork                 string                 `json:"previous_work"`
	ResumeExternalUrl            string                 `json:"resume_external_url"`
	ResumeInternalUrl            string                 `json:"resume_internal_url"`
	FoundersAgreementExternalUrl string                 `json:"founders_agreement_external_url"`
	FoundersAgreementInternalUrl string                 `json:"founders_agreement_internal_url"`
	CreatedAt                    string                 `json:"created_at"`
	UpdatedAt                    string                 `json:"updated_at"`
}

type TeamMembersResponse struct {
	TeamMembers []TeamMemberResponse `json:"team_members"`
}
