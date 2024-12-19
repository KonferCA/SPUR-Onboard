// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db

import (
	"database/sql/driver"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

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
	ProjectStatus ProjectStatus
	Valid         bool // Valid is true if ProjectStatus is not NULL
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

type UserRole string

const (
	UserRoleAdmin        UserRole = "admin"
	UserRoleStartupOwner UserRole = "startup_owner"
	UserRoleInvestor     UserRole = "investor"
)

func (e *UserRole) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = UserRole(s)
	case string:
		*e = UserRole(s)
	default:
		return fmt.Errorf("unsupported scan type for UserRole: %T", src)
	}
	return nil
}

type NullUserRole struct {
	UserRole UserRole
	Valid    bool // Valid is true if UserRole is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullUserRole) Scan(value interface{}) error {
	if value == nil {
		ns.UserRole, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.UserRole.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullUserRole) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.UserRole), nil
}

func (e UserRole) Valid() bool {
	switch e {
	case UserRoleAdmin,
		UserRoleStartupOwner,
		UserRoleInvestor:
		return true
	}
	return false
}

func AllUserRoleValues() []UserRole {
	return []UserRole{
		UserRoleAdmin,
		UserRoleStartupOwner,
		UserRoleInvestor,
	}
}

type Company struct {
	ID            string
	OwnerID       string
	Name          string
	WalletAddress *string
	LinkedinUrl   string
	CreatedAt     int64
	UpdatedAt     int64
}

type Project struct {
	ID          string
	CompanyID   string
	Title       string
	Description *string
	Status      ProjectStatus
	CreatedAt   int64
	UpdatedAt   int64
}

type ProjectAnswer struct {
	ID         string
	ProjectID  string
	QuestionID string
	Answer     string
	CreatedAt  int64
	UpdatedAt  int64
}

type ProjectComment struct {
	ID          string
	ProjectID   string
	TargetID    string
	Comment     string
	CommenterID string
	CreatedAt   int64
	UpdatedAt   int64
}

type ProjectDocument struct {
	ID        string
	ProjectID string
	Name      string
	Url       string
	Section   string
	CreatedAt int64
	UpdatedAt int64
}

type ProjectQuestion struct {
	ID        string
	Question  string
	Section   string
	CreatedAt int64
	UpdatedAt int64
}

type TeamMember struct {
	ID             string
	CompanyID      string
	FirstName      string
	LastName       string
	Title          string
	Bio            string
	LinkedinUrl    string
	IsAccountOwner bool
	CreatedAt      int64
	UpdatedAt      int64
}

type Transaction struct {
	ID          string
	ProjectID   string
	CompanyID   string
	TxHash      string
	FromAddress string
	ToAddress   string
	ValueAmount pgtype.Numeric
}

type User struct {
	ID            string
	Email         string
	Password      string
	Role          UserRole
	EmailVerified bool
	CreatedAt     int64
	UpdatedAt     int64
	TokenSalt     []byte
}

type VerifyEmailToken struct {
	ID        string
	UserID    string
	CreatedAt int64
	ExpiresAt int64
}
