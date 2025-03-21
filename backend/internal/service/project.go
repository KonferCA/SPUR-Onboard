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
	err = queries.MatchProjectTitletoCompanyNameQuestion(ctx, projectID)
	if err != nil {
		return err
	}

	// Create a new snapshot
	return CreateProjectSnapshot(queries, ctx, projectID)
}
