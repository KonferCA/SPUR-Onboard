// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db

import (
	"database/sql/driver"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

type InputTypeEnum string

const (
	InputTypeEnumUrl       InputTypeEnum = "url"
	InputTypeEnumFile      InputTypeEnum = "file"
	InputTypeEnumTextarea  InputTypeEnum = "textarea"
	InputTypeEnumTextinput InputTypeEnum = "textinput"
	InputTypeEnumSelect    InputTypeEnum = "select"
	InputTypeEnumTeam      InputTypeEnum = "team"
	InputTypeEnumCheckbox  InputTypeEnum = "checkbox"
	InputTypeEnumRadio     InputTypeEnum = "radio"
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
		InputTypeEnumTeam,
		InputTypeEnumCheckbox,
		InputTypeEnumRadio:
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
		InputTypeEnumTeam,
		InputTypeEnumCheckbox,
		InputTypeEnumRadio,
	}
}

type ProjectStatus string

const (
	ProjectStatusDraft     ProjectStatus = "draft"
	ProjectStatusPending   ProjectStatus = "pending"
	ProjectStatusVerified  ProjectStatus = "verified"
	ProjectStatusDeclined  ProjectStatus = "declined"
	ProjectStatusWithdrawn ProjectStatus = "withdrawn"
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
		ProjectStatusWithdrawn:
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
	}
}

type Company struct {
	ID            string  `json:"id"`
	OwnerID       string  `json:"owner_id"`
	Name          string  `json:"name"`
	WalletAddress *string `json:"wallet_address"`
	LinkedinUrl   string  `json:"linkedin_url"`
	CreatedAt     int64   `json:"created_at"`
	UpdatedAt     int64   `json:"updated_at"`
}

type Project struct {
	ID          string        `json:"id"`
	CompanyID   string        `json:"company_id"`
	Title       string        `json:"title"`
	Description *string       `json:"description"`
	Status      ProjectStatus `json:"status"`
	CreatedAt   int64         `json:"created_at"`
	UpdatedAt   int64         `json:"updated_at"`
}

type ProjectAnswer struct {
	ID          string `json:"id"`
	ProjectID   string `json:"project_id"`
	QuestionID  string `json:"question_id"`
	InputTypeID string `json:"input_type_id"`
	Answer      string `json:"answer"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
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
	CreatedAt  int64  `json:"created_at"`
	UpdatedAt  int64  `json:"updated_at"`
}

type ProjectQuestion struct {
	ID              string `json:"id"`
	Question        string `json:"question"`
	Section         string `json:"section"`
	SubSection      string `json:"sub_section"`
	SectionOrder    int32  `json:"section_order"`
	SubSectionOrder int32  `json:"sub_section_order"`
	QuestionOrder   int32  `json:"question_order"`
	Required        bool   `json:"required"`
	CreatedAt       int64  `json:"created_at"`
	UpdatedAt       int64  `json:"updated_at"`
}

type QuestionInputType struct {
	ID          string        `json:"id"`
	QuestionID  string        `json:"question_id"`
	InputType   InputTypeEnum `json:"input_type"`
	Options     []string      `json:"options"`
	Validations *string       `json:"validations"`
	CreatedAt   int64         `json:"created_at"`
	UpdatedAt   int64         `json:"updated_at"`
}

type TeamMember struct {
	ID             string `json:"id"`
	CompanyID      string `json:"company_id"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	Title          string `json:"title"`
	Bio            string `json:"bio"`
	LinkedinUrl    string `json:"linkedin_url"`
	IsAccountOwner bool   `json:"is_account_owner"`
	CreatedAt      int64  `json:"created_at"`
	UpdatedAt      int64  `json:"updated_at"`
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
	ID            string  `json:"id"`
	FirstName     *string `json:"first_name"`
	LastName      *string `json:"last_name"`
	Bio           *string `json:"bio"`
	Title         *string `json:"title"`
	Linkedin      *string `json:"linkedin"`
	Email         string  `json:"email"`
	Password      string  `json:"password"`
	Permissions   int32   `json:"permissions"`
	EmailVerified bool    `json:"email_verified"`
	CreatedAt     int64   `json:"created_at"`
	UpdatedAt     int64   `json:"updated_at"`
	TokenSalt     []byte  `json:"token_salt"`
}

type VerifyEmailToken struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	CreatedAt int64  `json:"created_at"`
	ExpiresAt int64  `json:"expires_at"`
}
