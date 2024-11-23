package server

import (
	"fmt"
	"net/http"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateProject(c echo.Context) error {
	var req *CreateProjectRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(req.CompanyID, "company")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyByID(ctx, companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	fmt.Printf("Creating project with params: company_id=%v, title=%s, status=%s\n",
		companyID, req.Title, req.Status)

	params := db.CreateProjectParams{
		CompanyID:   companyID,
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
	}

	project, err := queries.CreateProject(ctx, params)
	if err != nil {
		fmt.Printf("Error creating project: %v\n", err)
		return handleDBError(err, "create", "project")
	}

	fmt.Printf("Created project: %+v\n", project)

	return c.JSON(http.StatusCreated, project)
}

func (s *Server) handleGetProject(c echo.Context) error {
	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	project, err := queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project")
	}

	return c.JSON(http.StatusOK, project)
}

func (s *Server) handleListProjects(c echo.Context) error {
	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	companyID := c.QueryParam("company_id")

	if companyID != "" {
		companyUUID, err := validateUUID(companyID, "company")
		if err != nil {
			return err
		}
		projects, err := queries.ListProjectsByCompany(ctx, companyUUID)
		if err != nil {
			return handleDBError(err, "fetch", "projects")
		}
		return c.JSON(http.StatusOK, projects)
	}

	projects, err := queries.ListProjects(ctx)
	if err != nil {
		return handleDBError(err, "fetch", "projects")
	}
	return c.JSON(http.StatusOK, projects)
}

func (s *Server) handleDeleteProject(c echo.Context) error {
	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	err = queries.DeleteProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "delete", "project")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleCreateProjectFile(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	var req *CreateProjectFileRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectFileRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	params := db.CreateProjectFileParams{
		ProjectID: projectID,
		FileType:  req.FileType,
		FileUrl:   req.FileURL,
	}

	file, err := queries.CreateProjectFile(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "project file")
	}

	return c.JSON(http.StatusCreated, file)
}

func (s *Server) handleListProjectFiles(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	files, err := queries.ListProjectFiles(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project files")
	}

	return c.JSON(http.StatusOK, files)
}

func (s *Server) handleDeleteProjectFile(c echo.Context) error {
	fileID, err := validateUUID(c.Param("id"), "file")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	err = queries.DeleteProjectFile(ctx, fileID)
	if err != nil {
		return handleDBError(err, "delete", "project file")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleCreateProjectComment(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	var req *CreateProjectCommentRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectCommentRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	userID, err := validateUUID(req.UserID, "user")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	params := db.CreateProjectCommentParams{
		ProjectID: projectID,
		UserID:    userID,
		Comment:   req.Comment,
	}

	comment, err := queries.CreateProjectComment(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "project comment")
	}

	return c.JSON(http.StatusCreated, comment)
}

func (s *Server) handleListProjectComments(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	comments, err := queries.GetProjectComments(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project comments")
	}

	return c.JSON(http.StatusOK, comments)
}

func (s *Server) handleDeleteProjectComment(c echo.Context) error {
	commentID, err := validateUUID(c.Param("id"), "comment")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	// First check if the comment exists using a direct query
	var exists bool
	err = s.DBPool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM project_comments WHERE id = $1)", commentID).Scan(&exists)
	if err != nil {
		return handleDBError(err, "verify", "project comment")
	}
	if !exists {
		return echo.NewHTTPError(http.StatusNotFound, "project comment not found :(")
	}

	err = queries.DeleteProjectComment(ctx, commentID)
	if err != nil {
		return handleDBError(err, "delete", "project comment")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleCreateProjectLink(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	var req *CreateProjectLinkRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectLinkRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	params := db.CreateProjectLinkParams{
		ProjectID: projectID,
		LinkType:  req.LinkType,
		Url:       req.URL,
	}

	link, err := queries.CreateProjectLink(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "project link")
	}

	return c.JSON(http.StatusCreated, link)
}

func (s *Server) handleListProjectLinks(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	links, err := queries.ListProjectLinks(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project links")
	}

	return c.JSON(http.StatusOK, links)
}

func (s *Server) handleDeleteProjectLink(c echo.Context) error {
	linkID, err := validateUUID(c.Param("id"), "link")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	err = queries.DeleteProjectLink(ctx, linkID)
	if err != nil {
		return handleDBError(err, "delete", "project link")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleAddProjectTag(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	var req *AddProjectTagRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*AddProjectTagRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	tagID, err := validateUUID(req.TagID, "tag")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	params := db.AddProjectTagParams{
		ProjectID: projectID,
		TagID:     tagID,
	}

	projectTag, err := queries.AddProjectTag(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "project tag")
	}

	return c.JSON(http.StatusCreated, projectTag)
}

func (s *Server) handleListProjectTags(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	tags, err := queries.ListProjectTags(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project tags")
	}

	return c.JSON(http.StatusOK, tags)
}

func (s *Server) handleDeleteProjectTag(c echo.Context) error {
	projectID, err := validateUUID(c.Param("project_id"), "project")
	if err != nil {
		return err
	}

	tagID, err := validateUUID(c.Param("tag_id"), "tag")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)
	params := db.DeleteProjectTagParams{
		ProjectID: projectID,
		TagID:     tagID,
	}

	err = queries.DeleteProjectTag(ctx, params)
	if err != nil {
		return handleDBError(err, "delete", "project tag")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleUpdateProject(c echo.Context) error {
	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	var req *UpdateProjectRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateProjectRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	// Verify project exists
	_, err = queries.GetProject(ctx, projectID)
	if err != nil {
		return handleDBError(err, "verify", "project")
	}

	description := req.Description
	params := db.UpdateProjectParams{
		ID:          projectID,
		Title:       req.Title,
		Description: &description,
		Status:      req.Status,
	}

	project, err := queries.UpdateProject(ctx, params)
	if err != nil {
		return handleDBError(err, "update", "project")
	}

	return c.JSON(http.StatusOK, project)
}
