package v1_teams

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/v1/v1_common"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

const (
	docTypeResume            = "resume"
	docTypeFoundersAgreement = "founders_agreement"
)

func (h *Handler) handleUploadTeamMemberDocument(c echo.Context) error {
	user, err := middleware.GetUserFromContext(c)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "unauthorized", err)
	}

	memberID := c.Param("member_id")
	if _, err := uuid.Parse(memberID); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid uuid", err)
	}

	docType := c.Param("type")
	if docType != docTypeResume && docType != docTypeFoundersAgreement {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid document type", nil)
	}

	queries := h.server.GetQueries()

	company, err := queries.GetCompanyByUserID(c.Request().Context(), user.ID)
	if err != nil {
		return v1_common.Fail(c, 404, "Company not found", err)
	}

	form := c.Request().MultipartForm
	var file *multipart.FileHeader
	for _, files := range form.File {
		file = files[0]
		break
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
	s3Key := fmt.Sprintf("member/%s/documents/%s/%s%s", memberID, docType, uuid.New().String(), fileExt)

	// Upload to S3
	fileURL, err := h.server.GetStorage().UploadFile(c.Request().Context(), s3Key, fileContent)
	if err != nil {
		return v1_common.Fail(c, 500, "Failed to upload file", err)
	}

	// get the team member
	member, err := queries.GetTeamMember(c.Request().Context(), db.GetTeamMemberParams{ID: memberID, CompanyID: company.ID})
	if err != nil {
		return v1_common.Fail(c, 400, "Failed to get team member", err)
	}

	uploadArg := db.UpdateTeamMemberDocumentsParams{
		ID:                           member.ID,
		CompanyID:                    member.CompanyID,
		ResumeInternalUrl:            member.ResumeInternalUrl,
		FoundersAgreementInternalUrl: member.FoundersAgreementInternalUrl,
	}

	switch docType {
	case docTypeFoundersAgreement:
		uploadArg.FoundersAgreementInternalUrl = &fileURL
	default:
		// default upload as resume
		uploadArg.ResumeInternalUrl = &fileURL
	}

	err = queries.UpdateTeamMemberDocuments(c.Request().Context(), uploadArg)
	if err != nil {
		_ = h.server.GetStorage().DeleteFile(c.Request().Context(), s3Key)
		return v1_common.Fail(c, 500, "Failed to save document record", err)
	}

	return c.JSON(http.StatusCreated, UploadTeamMemberDocumentResponse{Url: fileURL})
}
