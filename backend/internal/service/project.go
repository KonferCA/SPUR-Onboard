package service

import (
	"KonferCA/SPUR/db"
	"context"
)

// CreateProjectSnapshot creates a new snapshot for a project and handles updating the version number of the new snapshot.
func CreateProjectSnapshot(queries *db.Queries, ctx context.Context, projectID string) error {
	count, err := queries.CountProjectSnapshots(ctx, projectID)
	if err != nil {
		return err
	}
	return queries.CreateProjectSnapshot(ctx, db.CreateProjectSnapshotParams{ID: projectID, VersionNumber: int32(count) + 1})
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
