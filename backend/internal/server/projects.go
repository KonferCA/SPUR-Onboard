package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"KonferCA/SPUR/db"
	mw "KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
)

type CreateProjectRequest struct {
	CompanyID   string        `json:"company_id"`
	Title       string        `json:"title"`
	Description *string       `json:"description"`
	Status      string        `json:"status"`
	Files       []ProjectFile `json:"files"`
	Links       []ProjectLink `json:"links"`
	Sections    []struct {
		Title     string `json:"title"`
		Questions []struct {
			Question string `json:"question"`
			Answer   string `json:"answer"`
		} `json:"questions"`
	} `json:"sections"`
}

func (s *Server) handleCreateProject(c echo.Context) error {
	ctx := c.Request().Context()

	var req *CreateProjectRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(req.CompanyID, "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	// Start a transaction
	tx, err := s.DBPool.Begin(ctx)
	if err != nil {
		return handleDBError(err, "begin", "transaction")
	}
	defer tx.Rollback(ctx)

	// Create project
	qtx := queries.WithTx(tx)
	params := db.CreateProjectParams{
		CompanyID:   companyID,
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
	}

	project, err := qtx.CreateProject(ctx, params)
	if err != nil {
		return handleDBError(err, "create", "project")
	}

	// Create files
	for _, file := range req.Files {
		fileParams := db.CreateProjectFileParams{
			ProjectID: project.ID,
			FileType:  file.FileType,
			FileUrl:   file.FileURL,
		}
		_, err := qtx.CreateProjectFile(ctx, fileParams)
		if err != nil {
			return handleDBError(err, "create", "project file")
		}
	}

	// Create links
	for _, link := range req.Links {
		linkParams := db.CreateProjectLinkParams{
			ProjectID: project.ID,
			LinkType:  link.LinkType,
			Url:       link.URL,
		}
		_, err := qtx.CreateProjectLink(ctx, linkParams)
		if err != nil {
			return handleDBError(err, "create", "project link")
		}
	}

	// Create sections and questions
	for _, section := range req.Sections {
		sectionParams := db.CreateProjectSectionParams{
			ProjectID: project.ID,
			Title:     section.Title,
		}

		projectSection, err := qtx.CreateProjectSection(ctx, sectionParams)
		if err != nil {
			return handleDBError(err, "create", "project section")
		}

		// Create questions for this section
		for _, q := range section.Questions {
			questionParams := db.CreateProjectQuestionParams{
				SectionID:    projectSection.ID,
				QuestionText: q.Question,
				AnswerText:   q.Answer,
			}

			_, err := qtx.CreateProjectQuestion(ctx, questionParams)
			if err != nil {
				return handleDBError(err, "create", "project question")
			}
		}
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return handleDBError(err, "commit", "transaction")
	}

	return c.JSON(http.StatusCreated, project)
}

func (s *Server) handleGetProject(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	project, err := queries.ListProjectWithDetails(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project")
	}

	return c.JSON(http.StatusOK, project)
}

func (s *Server) handleListProjects(c echo.Context) error {
	ctx := c.Request().Context()

	// Get authenticated user from context
	user := c.Get("user").(db.User)
	fmt.Printf("DEBUG: User accessing projects - ID: %s, Role: %s\n", user.ID, user.Role)

	queries := db.New(s.DBPool)

	// If user is admin, they can see all projects or filter by company
	if user.Role == "admin" {
		fmt.Println("DEBUG: User is admin, can see all projects")
		companyID := c.QueryParam("company_id")
		if companyID != "" {
			fmt.Printf("DEBUG: Admin filtering by company_id: %s\n", companyID)
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

	// For non-admin users, get their company ID from employee record
	employee, err := queries.GetEmployeeByEmail(ctx, user.Email)
	if err != nil {
		fmt.Printf("DEBUG: Error fetching employee record: %v\n", err)
		return handleDBError(err, "fetch", "employee")
	}

	fmt.Printf("DEBUG: Regular user, filtering by their company_id: %s\n", employee.CompanyID)
	projects, err := queries.ListProjectsByCompany(ctx, employee.CompanyID)
	if err != nil {
		fmt.Printf("DEBUG: Error fetching projects: %v\n", err)
		return handleDBError(err, "fetch", "projects")
	}
	fmt.Printf("DEBUG: Found %d projects for company %s\n", len(projects), employee.CompanyID)
	return c.JSON(http.StatusOK, projects)
}

func (s *Server) handleDeleteProject(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	// Get the file from form data
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "file is required")
	}

	fileType := c.FormValue("file_type")
	if fileType == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "file_type is required")
	}

	// Upload file to storage
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read file")
	}
	defer src.Close()

	// Read file contents
	fileBytes, err := io.ReadAll(src)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read file contents")
	}

	// Generate unique file key
	fileExt := filepath.Ext(file.Filename)
	fileKey := fmt.Sprintf("uploads/%d%s", time.Now().UnixNano(), fileExt)

	fileURL, err := s.Storage.UploadFile(c.Request().Context(), fileKey, fileBytes)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to upload file")
	}

	// Create database record
	queries := db.New(s.DBPool)
	params := db.CreateProjectFileParams{
		ProjectID: projectID,
		FileType:  fileType,
		FileUrl:   fileURL,
	}

	projectFile, err := queries.CreateProjectFile(ctx, params)
	if err != nil {
		// Try to cleanup the uploaded file if database record creation fails
		if fileURL != "" {
			// Extract key from URL
			parts := strings.Split(fileURL, ".amazonaws.com/")
			if len(parts) == 2 {
				_ = s.Storage.DeleteFile(c.Request().Context(), parts[1])
			}
		}
		return handleDBError(err, "create", "project file")
	}

	return c.JSON(http.StatusCreated, projectFile)
}

func (s *Server) handleListProjectFiles(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	files, err := queries.ListProjectFiles(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project files")
	}

	return c.JSON(http.StatusOK, files)
}

func (s *Server) handleDeleteProjectFile(c echo.Context) error {
	ctx := c.Request().Context()

	fileID, err := validateUUID(c.Param("id"), "file")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	err = queries.DeleteProjectFile(ctx, fileID)
	if err != nil {
		return handleDBError(err, "delete", "project file")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleCreateProjectComment(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	comments, err := queries.GetProjectComments(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project comments")
	}

	return c.JSON(http.StatusOK, comments)
}

func (s *Server) handleDeleteProjectComment(c echo.Context) error {
	ctx := c.Request().Context()

	commentID, err := validateUUID(c.Param("id"), "comment")
	if err != nil {
		return err
	}

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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	var req *CreateProjectLinkRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateProjectLinkRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	links, err := queries.ListProjectLinks(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project links")
	}

	return c.JSON(http.StatusOK, links)
}

func (s *Server) handleDeleteProjectLink(c echo.Context) error {
	ctx := c.Request().Context()

	linkID, err := validateUUID(c.Param("id"), "link")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	err = queries.DeleteProjectLink(ctx, linkID)
	if err != nil {
		return handleDBError(err, "delete", "project link")
	}

	return c.NoContent(http.StatusNoContent)
}

func (s *Server) handleAddProjectTag(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	tags, err := queries.ListProjectTags(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project tags")
	}

	return c.JSON(http.StatusOK, tags)
}

func (s *Server) handleDeleteProjectTag(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	tagID, err := validateUUID(c.Param("tag_id"), "tag")
	if err != nil {
		return err
	}

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
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	var req *UpdateProjectRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateProjectRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

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

func (s *Server) handleGetProjectDetails(c echo.Context) error {
	ctx := c.Request().Context()

	projectID, err := validateUUID(c.Param("id"), "project")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	project, err := queries.ListProjectWithDetails(ctx, projectID)
	if err != nil {
		return handleDBError(err, "fetch", "project details")
	}

	// decode sections from json
	var sections []map[string]interface{}
	if project.Sections != nil {
		sectionsBytes, ok := project.Sections.([]byte)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "invalid sections format")
		}
		if err := json.Unmarshal(sectionsBytes, &sections); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to parse sections")
		}
	}

	// decode documents from json
	var documents []map[string]interface{}
	if project.Documents != nil {
		documentsBytes, ok := project.Documents.([]byte)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "invalid documents format")
		}
		if err := json.Unmarshal(documentsBytes, &documents); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to parse documents")
		}
	}

	// create response with parsed json
	response := map[string]interface{}{
		"id":          project.ID,
		"company_id":  project.CompanyID,
		"title":       project.Title,
		"description": project.Description,
		"status":      project.Status,
		"created_at":  project.CreatedAt,
		"updated_at":  project.UpdatedAt,
		"company": map[string]interface{}{
			"id":           project.CompanyID,
			"name":         project.CompanyName,
			"industry":     project.CompanyIndustry,
			"founded_date": project.CompanyFoundedDate,
			"stage":        project.CompanyStage,
		},
		"sections":  sections,
		"documents": documents,
	}

	return c.JSON(http.StatusOK, response)
}
