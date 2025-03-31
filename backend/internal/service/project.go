package service

import (
	"KonferCA/SPUR/db"
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// CreateProjectSnapshot creates a new snapshot for a project and handles updating the version number of the new snapshot.
func CreateProjectSnapshot(queries *db.Queries, ctx context.Context, projectID string) error {
	latestSnap, err := queries.GetLatestProjectSnapshot(ctx, projectID)
	if err != nil {
		if err != pgx.ErrNoRows {
			return err
		}
		// Explicitly set the version number to 0 so the addition below make it 1
		latestSnap.VersionNumber = 0
	}

	// Parse the latest snapshot id to set as the parent snapshot id for the new snapshot
	var pgUUID pgtype.UUID
	parsedUUID, err := uuid.Parse(latestSnap.ID)
	if err != nil {
		pgUUID.Valid = false
	} else {
		pgUUID.Bytes = parsedUUID
		pgUUID.Valid = true
	}

	return queries.CreateProjectSnapshot(
		ctx,
		db.CreateProjectSnapshotParams{
			ID:               projectID,
			VersionNumber:    latestSnap.VersionNumber + 1,
			ParentSnapshotID: pgUUID,
		},
	)
}

// SubmitProject sets the status of a project as "pending", updates the project's title according to company_name question and
// creates a snapshot for the project.
func SubmitProject(queries *db.Queries, ctx context.Context, projectID string) error {
	// Update project status to pending
	err := queries.UpdateProjectStatus(ctx, db.UpdateProjectStatusParams{
		ID:     projectID,
		Status: db.ProjectStatusPending,
	})
	if err != nil {
		return err
	}

	// Update the projects table title column
	err = queries.MatchProjectTitleToCompanyNameQuestion(ctx, projectID)
	if err != nil {
		return err
	}

	// Create a new snapshot
	return CreateProjectSnapshot(queries, ctx, projectID)
}

// GetLatestProjectSnapshot gets the latest project snapshot based on the created_at timestamp.
func GetLatestProjectSnapshot(queries *db.Queries, ctx context.Context, projectID string) (db.ProjectSnapshot, error) {
	snapshot, err := queries.GetLatestProjectSnapshot(ctx, projectID)
	if err != nil {
		return db.ProjectSnapshot{}, err
	}
	return snapshot, nil
}

// CreateProjectComment creates a new project comment, sets the 'allow_edit' flag to 'true', and update project status to 'needs review'.
// The affect project row is one matching the project id in the comment parameters.
func CreateProjectComment(queries *db.Queries, ctx context.Context, commentParams db.CreateProjectCommentParams) (db.ProjectComment, error) {
	// Create new comment
	comment, err := queries.CreateProjectComment(ctx, commentParams)
	if err != nil {
		return db.ProjectComment{}, err
	}

	// Set 'allow_flag' to true
	err = queries.SetProjectAllowEdit(ctx, db.SetProjectAllowEditParams{
		AllowEdit: true,
		ID:        commentParams.ProjectID,
	})
	if err != nil {
		return db.ProjectComment{}, err
	}

	// Set project status to 'needs review'
	err = queries.UpdateProjectStatus(ctx, db.UpdateProjectStatusParams{
		ID:     commentParams.ProjectID,
		Status: db.ProjectStatusNeedsreview,
	})
	if err != nil {
		return db.ProjectComment{}, err
	}

	return comment, nil
}
