package server

import (
	"context"
	"net/http"
	"time"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateMeeting(c echo.Context) error {
	var req *CreateMeetingRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateMeetingRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	projectID, err := validateUUID(req.ProjectID, "project")
	if err != nil {
		return err
	}

	userID, err := validateUUID(req.ScheduledByUserID, "user")
	if err != nil {
		return err
	}

	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return err
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return err
	}

	if err := validateTimeRange(startTime, endTime); err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetProject(context.Background(), projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	params := db.CreateMeetingParams{
		ProjectID:         projectID,
		ScheduledByUserID: userID,
		StartTime:         startTime,
		EndTime:           endTime,
		MeetingUrl:        req.MeetingURL,
		Location:          req.Location,
		Notes:             req.Notes,
	}

	meeting, err := queries.CreateMeeting(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "meeting")
	}

	return c.JSON(http.StatusCreated, meeting)
}

func (s *Server) handleGetMeeting(c echo.Context) error {
	meetingID, err := validateUUID(c.Param("id"), "meeting")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	meeting, err := queries.GetMeeting(context.Background(), meetingID)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return echo.NewHTTPError(http.StatusNotFound, "meeting not found :(")
		}

		return handleDBError(err, "fetch", "meeting")
	}

	return c.JSON(http.StatusOK, meeting)
}

func (s *Server) handleListMeetings(c echo.Context) error {
	queries := db.New(s.DBPool)
	projectID := c.QueryParam("project_id")

	if projectID != "" {
		projectUUID, err := validateUUID(projectID, "project")
		if err != nil {
			return err
		}

		meetings, err := queries.ListProjectMeetings(context.Background(), projectUUID)
		if err != nil {
			return handleDBError(err, "fetch", "meetings")
		}

		return c.JSON(http.StatusOK, meetings)
	}

	meetings, err := queries.ListMeetings(context.Background())
	if err != nil {
		return handleDBError(err, "fetch", "meetings")
	}

	return c.JSON(http.StatusOK, meetings)
}

func (s *Server) handleUpdateMeeting(c echo.Context) error {
	meetingID, err := validateUUID(c.Param("id"), "meeting")
	if err != nil {
		return err
	}

	var req *UpdateMeetingRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateMeetingRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return err
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return err
	}

	if err := validateTimeRange(startTime, endTime); err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetMeeting(context.Background(), meetingID)
	if err != nil {
		return handleDBError(err, "verify", "meeting")
	}

	params := db.UpdateMeetingParams{
		ID:         meetingID,
		StartTime:  startTime,
		EndTime:    endTime,
		MeetingUrl: req.MeetingURL,
		Location:   req.Location,
		Notes:      req.Notes,
	}

	meeting, err := queries.UpdateMeeting(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "meeting")
	}

	return c.JSON(http.StatusOK, meeting)
}

func (s *Server) handleDeleteMeeting(c echo.Context) error {
	meetingID, err := validateUUID(c.Param("id"), "meeting")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetMeeting(context.Background(), meetingID)
	if err != nil {
		return handleDBError(err, "verify", "meeting")
	}

	err = queries.DeleteMeeting(context.Background(), meetingID)
	if err != nil {
		return handleDBError(err, "delete", "meeting")
	}

	return c.NoContent(http.StatusNoContent)
}
