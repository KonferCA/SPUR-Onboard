package v1_projects

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/v1/v1_common"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
 * handleUploadProjectDocument handles file uploads for a project.
 *
 * Flow:
 * 1. Validates file presence
 * 2. Verifies project ownership
 * 3. Uploads file to S3
 * 4. Creates document record in database
 * 5. Returns document details
 *
 * Cleanup:
 * - Deletes S3 file if database insert fails
 */
func (h *Handler) handleUploadProjectDocument(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Validate form fields
	// Must have: file, name, section, and sub_section
	var req UploadDocumentRequest
	if err := v1_common.BindandValidate(c, &req); err != nil {
		return v1_common.Fail(c, 400, "Invalid request", err)
	}

	log.Debug().Any("req", req).Send()

	form := c.Request().MultipartForm
	var file *multipart.FileHeader
	for _, files := range form.File {
		file = files[0]
		break
	}

	mimeType := file.Header.Get("Content-Type")

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
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
		ProjectID:  projectID,
		QuestionID: req.QuestionID,
		Url:        fileURL,
		Name:       req.Name,
		Section:    req.Section,
		SubSection: req.SubSection,
		MimeType:   mimeType,
		Size:       int64(len(fileContent)),
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

/*
 * handleGetProjectDocuments retrieves all documents for a project.
 *
 * Returns:
 * - Document ID, name, URL
 * - Section assignment
 * - Creation/update timestamps
 *
 * Security:
 * - Verifies project belongs to user's company
 */
func (h *Handler) handleGetProjectDocuments(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	// Get project ID from URL
	projectID := c.Param("id")
	if projectID == "" {
		return v1_common.Fail(c, 400, "Project ID is required", nil)
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

/*
 * handleDeleteProjectDocument removes a document from a project.
 *
 * Flow:
 * 1. Verifies document ownership
 * 2. Deletes file from S3
 * 3. Removes database record
 *
 * Security:
 * - Verifies document belongs to user's project
 */
func (h *Handler) handleDeleteProjectDocument(c echo.Context) error {
	user, err := getUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Unauthorized", err)
	}

	// Get project ID and document ID from URL
	projectID := c.Param("id")
	documentID := c.Param("document_id")
	if projectID == "" || documentID == "" {
		return v1_common.Fail(c, 400, "Project ID and Document ID are required", nil)
	}

	// Get company owned by user
	company, err := h.server.GetQueries().GetCompanyByUserID(c.Request().Context(), user.ID)
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
