package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"github.com/labstack/echo/v4"
	"github.com/google/uuid"
	"time"
	"database/sql"
	"io"
	"fmt"
	"path/filepath"
	"strings"
	"os"
	"net/http"
)

type ValidationError struct {
	Question string `json:"question"`
	Message  string `json:"message"`
}

func (h *Handler) handleCreateProject(c echo.Context) error {
	var req CreateProjectRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, 400, "Invalid request", err)
	}

	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Start a transaction
	ctx := c.Request().Context()
	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to start transaction", err)
	}
	defer tx.Rollback(ctx) // Will be no-op if committed

	// Create queries with transaction
	qtx := h.server.GetQueries().WithTx(tx)

	// Create project within transaction
	now := time.Now().Unix()
	description := req.Description
	project, err := qtx.CreateProject(ctx, db.CreateProjectParams{
		ID:          uuid.New().String(),
		CompanyID:   company.ID,
		Title:       req.Title,
		Description: &description,
		Status:      db.ProjectStatusDraft,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to create project", err)
	}

	// Create empty answers within same transaction
	_, err = qtx.CreateProjectAnswers(ctx, project.ID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to create project answers", err)
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return v1_common.Fail(c, 500, "Failed to commit transaction", err)
	}

	// Return success response
	return c.JSON(200, ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: description,
		Status:      project.Status,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	})
}

func (h *Handler) handleGetProjects(c echo.Context) error {
	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get all projects for this company
	projects, err := h.server.GetQueries().GetProjectsByCompanyID(c.Request().Context(), company.ID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to fetch projects", err)
	}

	// Convert to response format
	response := make([]ProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}
		
		response[i] = ProjectResponse{
			ID:          project.ID,
			Title:       project.Title,
			Description: description,
			Status:      project.Status,
			CreatedAt:   project.CreatedAt,
			UpdatedAt:   project.UpdatedAt,
		}
	}

	return c.JSON(200, response)
}

func (h *Handler) handleGetProject(c echo.Context) error {
	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get project (with company ID check for security)
	project, err := h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Convert to response format
	description := ""
	if project.Description != nil {
		description = *project.Description
	}

	return c.JSON(200, ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: description,
		Status:      project.Status,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	})
}


func (h *Handler) handlePatchProjectAnswer(c echo.Context) error {
	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Parse request body
	var req PatchAnswerRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, 400, "Invalid request body", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get the question for this answer to check validations
	question, err := h.server.GetQueries().GetQuestionByAnswerID(c.Request().Context(), req.AnswerID)
	if err != nil {
		return v1_common.Fail(c, 404, "Question not found", err)
	}

	// Validate the answer if validations exist
	if question.Validations != nil && *question.Validations != "" {
		if !isValidAnswer(req.Content, *question.Validations) {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"message": "Validation failed",
				"validation_errors": []ValidationError{
					{
						Question: question.Question,
						Message:  getValidationMessage(*question.Validations),
					},
				},
			})
		}
	}

	// Update the answer
	_, err = h.server.GetQueries().UpdateProjectAnswer(c.Request().Context(), db.UpdateProjectAnswerParams{
		Answer:    req.Content,
		ID:        req.AnswerID,
		ProjectID: projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return v1_common.Fail(c, 404, "Answer not found", err)
		}
		return v1_common.Fail(c, 500, "Failed to update answer", err)
	}

	return c.JSON(200, map[string]string{
		"message": "Answer updated successfully",
	})
}

func (h *Handler) handleGetProjectAnswers(c echo.Context) error {
	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Verify company ownership
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get project answers
	answers, err := h.server.GetQueries().GetProjectAnswers(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to get project answers", err)
	}

	// Verify project belongs to company
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Convert to response format
	response := make([]ProjectAnswerResponse, len(answers))
	for i, a := range answers {
		response[i] = ProjectAnswerResponse{
			ID:         a.AnswerID,
			QuestionID: a.QuestionID,
			Question:   a.Question,
			Answer:     a.Answer,
			Section:    a.Section,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"answers": response,
	})
}

func (h *Handler) handleUploadProjectDocument(c echo.Context) error {
	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "No file provided", err)
	}
	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get company owned by user to verify ownership
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Verify project belongs to company
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to open file", err)
	}
	defer src.Close()

	// Read file content
	fileContent, err := io.ReadAll(src)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to read file", err)
	}

	// Generate S3 key
	fileExt := filepath.Ext(file.Filename)
	s3Key := fmt.Sprintf("projects/%s/documents/%s%s", projectID, uuid.New().String(), fileExt)

	// Upload to S3
	fileURL, err := h.server.GetStorage().UploadFile(c.Request().Context(), s3Key, fileContent)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to upload file", err)
	}

	// Save document record in database
	doc, err := h.server.GetQueries().CreateProjectDocument(c.Request().Context(), db.CreateProjectDocumentParams{
		ProjectID: projectID,
		Name:      c.FormValue("name"),
		Url:       fileURL,
		Section:   c.FormValue("section"),
	})
	if err != nil {
		// Try to cleanup the uploaded file if database insert fails
		_ = h.server.GetStorage().DeleteFile(c.Request().Context(), s3Key)
		return v1_common.Fail(c, 500, "Failed to save document record", err)
	}

	return c.JSON(201, DocumentResponse{
		ID:        doc.ID,
		Name:      doc.Name,
		URL:       doc.Url,
		Section:   doc.Section,
		CreatedAt: doc.CreatedAt,
		UpdatedAt: doc.UpdatedAt,
	})
}

func (h *Handler) handleGetProjectDocuments(c echo.Context) error {
	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get company owned by user to verify ownership
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Verify project belongs to company
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, 404, "Project not found", err)
	}

	// Get documents for this project
	docs, err := h.server.GetQueries().GetProjectDocuments(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to get documents", err)
	}

	// Convert to response format
	response := make([]DocumentResponse, len(docs))
	for i, doc := range docs {
		response[i] = DocumentResponse{
			ID:        doc.ID,
			Name:      doc.Name,
			URL:       doc.Url,
			Section:   doc.Section,
			CreatedAt: doc.CreatedAt,
			UpdatedAt: doc.UpdatedAt,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"documents": response,
	})
}

func (h *Handler) handleDeleteProjectDocument(c echo.Context) error {
	// Get user ID from context
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", nil)
	}

	// Get project ID and document ID from URL
	projectID := c.Param("id")
	documentID := c.Param("document_id")
	if projectID == "" || documentID == "" {
		return v1_common.Fail(c, 400, "Project ID and Document ID are required", nil)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", nil)
	}

	// First get the document to get its S3 URL
	doc, err := h.server.GetQueries().GetProjectDocument(c.Request().Context(), db.GetProjectDocumentParams{
		ID:        documentID,
		ProjectID: projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, 404, "Document not found", nil)
		}
		return v1_common.Fail(c, 500, "Failed to get document", nil)
	}

	// Delete from S3 first
	s3Key := strings.TrimPrefix(doc.Url, "https://"+os.Getenv("AWS_S3_BUCKET")+".s3.us-east-1.amazonaws.com/")
	err = h.server.GetStorage().DeleteFile(c.Request().Context(), s3Key)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to delete file from storage", nil)
	}

	// Then delete from database
	deletedID, err := h.server.GetQueries().DeleteProjectDocument(c.Request().Context(), db.DeleteProjectDocumentParams{
		ID:        documentID,
		ProjectID: projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		if err.Error() == "no rows in result set" {
			return v1_common.Fail(c, 404, "Document not found or already deleted", nil)
		}
		return v1_common.Fail(c, 500, "Failed to delete document", nil)
	}
	
	if deletedID == "" {
		return v1_common.Fail(c, 404, "Document not found or already deleted", nil)
	}

	return c.JSON(200, map[string]string{
		"message": "Document deleted successfully",
	})
}

func (h *Handler) handleListCompanyProjects(c echo.Context) error {
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, 401, "Unauthorized", nil)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", nil)
	}

	// Get all projects for this company
	projects, err := h.server.GetQueries().ListCompanyProjects(c.Request().Context(), company.ID)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to fetch projects", nil)
	}

	// Convert to response format
	response := make([]ProjectResponse, len(projects))
	for i, project := range projects {
		description := ""
		if project.Description != nil {
			description = *project.Description
		}
		
		response[i] = ProjectResponse{
			ID:          project.ID,
			Title:       project.Title,
			Description: description,
			Status:      project.Status,
			CreatedAt:   project.CreatedAt,
			UpdatedAt:   project.UpdatedAt,
		}
	}

	return c.JSON(200, map[string]interface{}{
		"projects": response,
	})
}

func (h *Handler) handleSubmitProject(c echo.Context) error {
	// Get user ID and verify ownership first
	userID, err := v1_common.GetUserID(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), userID.String())
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
	}

	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, http.StatusBadRequest, "Project ID is required", nil)
	}

	// Verify project belongs to company
	_, err = h.server.GetQueries().GetProjectByID(c.Request().Context(), db.GetProjectByIDParams{
		ID:        projectID,
		CompanyID: company.ID,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusNotFound, "Project not found", err)
	}

	// Get all questions and answers for this project
	answers, err := h.server.GetQueries().GetProjectAnswers(c.Request().Context(), projectID)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project answers", err)
	}

	// Get all questions
	questions, err := h.server.GetQueries().GetProjectQuestions(c.Request().Context())
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get project questions", err)
	}

	var validationErrors []ValidationError

	// Create a map of question IDs to answers for easy lookup
	answerMap := make(map[string]string)
	for _, answer := range answers {
		answerMap[answer.QuestionID] = answer.Answer
	}

	// Validate each question
	for _, question := range questions {
		answer, exists := answerMap[question.ID]
		
		// Check if required question is answered
		if question.Required && (!exists || answer == "") {
			validationErrors = append(validationErrors, ValidationError{
				Question: question.Question,
				Message:  "This question requires an answer",
			})
			continue
		}

		// Skip validation if answer is empty and question is not required
		if !exists || answer == "" {
			continue
		}

		// Validate answer against rules if validations exist
		if question.Validations != nil && *question.Validations != "" {
			if !isValidAnswer(answer, *question.Validations) {
				validationErrors = append(validationErrors, ValidationError{
					Question: question.Question,
					Message:  getValidationMessage(*question.Validations),
				})
			}
		}
	}

	// If there are any validation errors, return them
	if len(validationErrors) > 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "Project validation failed",
			"validation_errors": validationErrors,
		})
	}

	// Update project status to pending
	err = h.server.GetQueries().UpdateProjectStatus(c.Request().Context(), db.UpdateProjectStatusParams{
		ID:     projectID,
		Status: db.ProjectStatusPending,
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to update project status", err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Project submitted successfully",
		"status": "pending",
	})
}
