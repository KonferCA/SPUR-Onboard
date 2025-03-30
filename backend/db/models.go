// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package db

import (
	"database/sql/driver"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

type ConditionTypeEnum string

const (
	ConditionTypeEnumNotEmpty ConditionTypeEnum = "not_empty"
	ConditionTypeEnumEmpty    ConditionTypeEnum = "empty"
	ConditionTypeEnumEquals   ConditionTypeEnum = "equals"
	ConditionTypeEnumContains ConditionTypeEnum = "contains"
)

func (e *ConditionTypeEnum) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = ConditionTypeEnum(s)
	case string:
		*e = ConditionTypeEnum(s)
	default:
		return fmt.Errorf("unsupported scan type for ConditionTypeEnum: %T", src)
	}
	return nil
}

type NullConditionTypeEnum struct {
	ConditionTypeEnum ConditionTypeEnum `json:"condition_type_enum"`
	Valid             bool              `json:"valid"` // Valid is true if ConditionTypeEnum is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullConditionTypeEnum) Scan(value interface{}) error {
	if value == nil {
		ns.ConditionTypeEnum, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.ConditionTypeEnum.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullConditionTypeEnum) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.ConditionTypeEnum), nil
}

func (e ConditionTypeEnum) Valid() bool {
	switch e {
	case ConditionTypeEnumNotEmpty,
		ConditionTypeEnumEmpty,
		ConditionTypeEnumEquals,
		ConditionTypeEnumContains:
		return true
	}
	return false
}

func AllConditionTypeEnumValues() []ConditionTypeEnum {
	return []ConditionTypeEnum{
		ConditionTypeEnumNotEmpty,
		ConditionTypeEnumEmpty,
		ConditionTypeEnumEquals,
		ConditionTypeEnumContains,
	}
}

type GroupTypeEnum string

const (
	GroupTypeEnumTeam    GroupTypeEnum = "team"
	GroupTypeEnumCompany GroupTypeEnum = "company"
)

func (e *GroupTypeEnum) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = GroupTypeEnum(s)
	case string:
		*e = GroupTypeEnum(s)
	default:
		return fmt.Errorf("unsupported scan type for GroupTypeEnum: %T", src)
	}
	return nil
}

type NullGroupTypeEnum struct {
	GroupTypeEnum GroupTypeEnum `json:"group_type_enum"`
	Valid         bool          `json:"valid"` // Valid is true if GroupTypeEnum is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullGroupTypeEnum) Scan(value interface{}) error {
	if value == nil {
		ns.GroupTypeEnum, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.GroupTypeEnum.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullGroupTypeEnum) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.GroupTypeEnum), nil
}

func (e GroupTypeEnum) Valid() bool {
	switch e {
	case GroupTypeEnumTeam,
		GroupTypeEnumCompany:
		return true
	}
	return false
}

func AllGroupTypeEnumValues() []GroupTypeEnum {
	return []GroupTypeEnum{
		GroupTypeEnumTeam,
		GroupTypeEnumCompany,
	}
}

type InputTypeEnum string

const (
	InputTypeEnumUrl              InputTypeEnum = "url"
	InputTypeEnumFile             InputTypeEnum = "file"
	InputTypeEnumTextarea         InputTypeEnum = "textarea"
	InputTypeEnumTextinput        InputTypeEnum = "textinput"
	InputTypeEnumSelect           InputTypeEnum = "select"
	InputTypeEnumMultiselect      InputTypeEnum = "multiselect"
	InputTypeEnumTeam             InputTypeEnum = "team"
	InputTypeEnumDate             InputTypeEnum = "date"
	InputTypeEnumFundingstructure InputTypeEnum = "fundingstructure"
)

func (e *InputTypeEnum) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = InputTypeEnum(s)
	case string:
		*e = InputTypeEnum(s)
	default:
		return fmt.Errorf("unsupported scan type for InputTypeEnum: %T", src)
	}
	return nil
}

type NullInputTypeEnum struct {
	InputTypeEnum InputTypeEnum `json:"input_type_enum"`
	Valid         bool          `json:"valid"` // Valid is true if InputTypeEnum is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullInputTypeEnum) Scan(value interface{}) error {
	if value == nil {
		ns.InputTypeEnum, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.InputTypeEnum.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullInputTypeEnum) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.InputTypeEnum), nil
}

func (e InputTypeEnum) Valid() bool {
	switch e {
	case InputTypeEnumUrl,
		InputTypeEnumFile,
		InputTypeEnumTextarea,
		InputTypeEnumTextinput,
		InputTypeEnumSelect,
		InputTypeEnumMultiselect,
		InputTypeEnumTeam,
		InputTypeEnumDate,
		InputTypeEnumFundingstructure:
		return true
	}
	return false
}

func AllInputTypeEnumValues() []InputTypeEnum {
	return []InputTypeEnum{
		InputTypeEnumUrl,
		InputTypeEnumFile,
		InputTypeEnumTextarea,
		InputTypeEnumTextinput,
		InputTypeEnumSelect,
		InputTypeEnumMultiselect,
		InputTypeEnumTeam,
		InputTypeEnumDate,
		InputTypeEnumFundingstructure,
	}
}

type ProjectStatus string

const (
	ProjectStatusDraft       ProjectStatus = "draft"
	ProjectStatusPending     ProjectStatus = "pending"
	ProjectStatusVerified    ProjectStatus = "verified"
	ProjectStatusDeclined    ProjectStatus = "declined"
	ProjectStatusWithdrawn   ProjectStatus = "withdrawn"
	ProjectStatusNeedsreview ProjectStatus = "needs review"
)

func (e *ProjectStatus) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = ProjectStatus(s)
	case string:
		*e = ProjectStatus(s)
	default:
		return fmt.Errorf("unsupported scan type for ProjectStatus: %T", src)
	}
	return nil
}

type NullProjectStatus struct {
	ProjectStatus ProjectStatus `json:"project_status"`
	Valid         bool          `json:"valid"` // Valid is true if ProjectStatus is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullProjectStatus) Scan(value interface{}) error {
	if value == nil {
		ns.ProjectStatus, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.ProjectStatus.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullProjectStatus) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.ProjectStatus), nil
}

func (e ProjectStatus) Valid() bool {
	switch e {
	case ProjectStatusDraft,
		ProjectStatusPending,
		ProjectStatusVerified,
		ProjectStatusDeclined,
		ProjectStatusWithdrawn,
		ProjectStatusNeedsreview:
		return true
	}
	return false
}

func AllProjectStatusValues() []ProjectStatus {
	return []ProjectStatus{
		ProjectStatusDraft,
		ProjectStatusPending,
		ProjectStatusVerified,
		ProjectStatusDeclined,
		ProjectStatusWithdrawn,
		ProjectStatusNeedsreview,
	}
}

type SocialPlatformEnum string

const (
	SocialPlatformEnumLinkedin  SocialPlatformEnum = "linkedin"
	SocialPlatformEnumInstagram SocialPlatformEnum = "instagram"
	SocialPlatformEnumFacebook  SocialPlatformEnum = "facebook"
	SocialPlatformEnumBluesky   SocialPlatformEnum = "bluesky"
	SocialPlatformEnumX         SocialPlatformEnum = "x"
	SocialPlatformEnumDiscord   SocialPlatformEnum = "discord"
	SocialPlatformEnumCustomUrl SocialPlatformEnum = "custom_url"
)

func (e *SocialPlatformEnum) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = SocialPlatformEnum(s)
	case string:
		*e = SocialPlatformEnum(s)
	default:
		return fmt.Errorf("unsupported scan type for SocialPlatformEnum: %T", src)
	}
	return nil
}

type NullSocialPlatformEnum struct {
	SocialPlatformEnum SocialPlatformEnum `json:"social_platform_enum"`
	Valid              bool               `json:"valid"` // Valid is true if SocialPlatformEnum is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullSocialPlatformEnum) Scan(value interface{}) error {
	if value == nil {
		ns.SocialPlatformEnum, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.SocialPlatformEnum.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullSocialPlatformEnum) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.SocialPlatformEnum), nil
}

func (e SocialPlatformEnum) Valid() bool {
	switch e {
	case SocialPlatformEnumLinkedin,
		SocialPlatformEnumInstagram,
		SocialPlatformEnumFacebook,
		SocialPlatformEnumBluesky,
		SocialPlatformEnumX,
		SocialPlatformEnumDiscord,
		SocialPlatformEnumCustomUrl:
		return true
	}
	return false
}

func AllSocialPlatformEnumValues() []SocialPlatformEnum {
	return []SocialPlatformEnum{
		SocialPlatformEnumLinkedin,
		SocialPlatformEnumInstagram,
		SocialPlatformEnumFacebook,
		SocialPlatformEnumBluesky,
		SocialPlatformEnumX,
		SocialPlatformEnumDiscord,
		SocialPlatformEnumCustomUrl,
	}
}

type Company struct {
	ID            string        `json:"id"`
	OwnerID       string        `json:"owner_id"`
	Name          string        `json:"name"`
	Description   *string       `json:"description"`
	DateFounded   int64         `json:"date_founded"`
	Stages        []string      `json:"stages"`
	Website       *string       `json:"website"`
	WalletAddress *string       `json:"wallet_address"`
	LinkedinUrl   string        `json:"linkedin_url"`
	CreatedAt     int64         `json:"created_at"`
	UpdatedAt     int64         `json:"updated_at"`
	GroupType     GroupTypeEnum `json:"group_type"`
}

type Project struct {
	ID                   string        `json:"id"`
	CompanyID            string        `json:"company_id"`
	Title                string        `json:"title"`
	Description          *string       `json:"description"`
	Status               ProjectStatus `json:"status"`
	CreatedAt            int64         `json:"created_at"`
	UpdatedAt            int64         `json:"updated_at"`
	LastSnapshotID       pgtype.UUID   `json:"last_snapshot_id"`
	OriginalSubmissionAt *int64        `json:"original_submission_at"`
	AllowEdit            bool          `json:"allow_edit"`
}

type ProjectAnswer struct {
	ID         string   `json:"id"`
	ProjectID  string   `json:"project_id"`
	QuestionID string   `json:"question_id"`
	Answer     string   `json:"answer"`
	Choices    []string `json:"choices"`
	CreatedAt  int64    `json:"created_at"`
	UpdatedAt  int64    `json:"updated_at"`
}

type ProjectComment struct {
	ID          string `json:"id"`
	ProjectID   string `json:"project_id"`
	TargetID    string `json:"target_id"`
	Comment     string `json:"comment"`
	CommenterID string `json:"commenter_id"`
	Resolved    bool   `json:"resolved"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type ProjectDocument struct {
	ID         string `json:"id"`
	ProjectID  string `json:"project_id"`
	QuestionID string `json:"question_id"`
	Name       string `json:"name"`
	Url        string `json:"url"`
	Section    string `json:"section"`
	SubSection string `json:"sub_section"`
	MimeType   string `json:"mime_type"`
	Size       int64  `json:"size"`
	CreatedAt  int64  `json:"created_at"`
	UpdatedAt  int64  `json:"updated_at"`
}

type ProjectQuestion struct {
	ID                  string                `json:"id"`
	Question            string                `json:"question"`
	Section             string                `json:"section"`
	SubSection          string                `json:"sub_section"`
	SectionOrder        int32                 `json:"section_order"`
	SubSectionOrder     int32                 `json:"sub_section_order"`
	QuestionOrder       int32                 `json:"question_order"`
	ConditionType       NullConditionTypeEnum `json:"condition_type"`
	ConditionValue      *string               `json:"condition_value"`
	DependentQuestionID pgtype.UUID           `json:"dependent_question_id"`
	Validations         []string              `json:"validations"`
	QuestionGroupID     pgtype.UUID           `json:"question_group_id"`
	InputType           InputTypeEnum         `json:"input_type"`
	Options             []string              `json:"options"`
	Required            bool                  `json:"required"`
	Placeholder         *string               `json:"placeholder"`
	Description         *string               `json:"description"`
	Disabled            bool                  `json:"disabled"`
	CreatedAt           int64                 `json:"created_at"`
	UpdatedAt           int64                 `json:"updated_at"`
	QuestionKey         *string               `json:"question_key"`
	InputProps          []byte                `json:"input_props"`
}

type ProjectQuestions20250220Backup struct {
	ID              string `json:"id"`
	Section         string `json:"section"`
	SubSection      string `json:"sub_section"`
	SectionOrder    int32  `json:"section_order"`
	SubSectionOrder int32  `json:"sub_section_order"`
	QuestionOrder   int32  `json:"question_order"`
}

type ProjectSnapshot struct {
	ID               string      `json:"id"`
	ProjectID        string      `json:"project_id"`
	Data             []byte      `json:"data"`
	VersionNumber    int32       `json:"version_number"`
	Title            string      `json:"title"`
	Description      *string     `json:"description"`
	ParentSnapshotID pgtype.UUID `json:"parent_snapshot_id"`
	CreatedAt        int64       `json:"created_at"`
}

type TeamMember struct {
	ID                           string  `json:"id"`
	CompanyID                    string  `json:"company_id"`
	FirstName                    string  `json:"first_name"`
	LastName                     string  `json:"last_name"`
	Title                        string  `json:"title"`
	LinkedinUrl                  string  `json:"linkedin_url"`
	IsAccountOwner               bool    `json:"is_account_owner"`
	PersonalWebsite              *string `json:"personal_website"`
	CommitmentType               string  `json:"commitment_type"`
	Introduction                 string  `json:"introduction"`
	IndustryExperience           string  `json:"industry_experience"`
	DetailedBiography            string  `json:"detailed_biography"`
	PreviousWork                 *string `json:"previous_work"`
	ResumeExternalUrl            *string `json:"resume_external_url"`
	ResumeInternalUrl            *string `json:"resume_internal_url"`
	FoundersAgreementExternalUrl *string `json:"founders_agreement_external_url"`
	FoundersAgreementInternalUrl *string `json:"founders_agreement_internal_url"`
	CreatedAt                    int64   `json:"created_at"`
	UpdatedAt                    int64   `json:"updated_at"`
	SocialLinks                  []byte  `json:"social_links"`
}

type Transaction struct {
	ID          string         `json:"id"`
	ProjectID   string         `json:"project_id"`
	CompanyID   string         `json:"company_id"`
	TxHash      string         `json:"tx_hash"`
	FromAddress string         `json:"from_address"`
	ToAddress   string         `json:"to_address"`
	ValueAmount pgtype.Numeric `json:"value_amount"`
	CreatedBy   string         `json:"created_by"`
	CreatedAt   int64          `json:"created_at"`
	UpdatedAt   int64          `json:"updated_at"`
}

type User struct {
	ID                string  `json:"id"`
	FirstName         *string `json:"first_name"`
	LastName          *string `json:"last_name"`
	Bio               *string `json:"bio"`
	Title             *string `json:"title"`
	Linkedin          *string `json:"linkedin"`
	Email             string  `json:"email"`
	Password          string  `json:"password"`
	Permissions       int32   `json:"permissions"`
	EmailVerified     bool    `json:"email_verified"`
	CreatedAt         int64   `json:"created_at"`
	UpdatedAt         int64   `json:"updated_at"`
	TokenSalt         []byte  `json:"token_salt"`
	ProfilePictureUrl *string `json:"profile_picture_url"`
}

type UserSocial struct {
	ID          string             `json:"id"`
	Platform    SocialPlatformEnum `json:"platform"`
	UrlOrHandle string             `json:"url_or_handle"`
	UserID      string             `json:"user_id"`
	CreatedAt   int64              `json:"created_at"`
	UpdatedAt   int64              `json:"updated_at"`
}

type VerifyEmailToken struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	CreatedAt int64  `json:"created_at"`
	ExpiresAt int64  `json:"expires_at"`
}
