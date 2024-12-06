package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/smithy-go"
	"github.com/labstack/echo/v4"
)

type UploadResponse struct {
	FileURL string `json:"file_url"`
}

func (s *Server) setupStorageRoutes() {
	fmt.Println("Setting up storage routes...")
	s.apiV1.POST("/storage/upload", s.handleFileUpload)
	fmt.Println("Storage routes set up")
}

func (s *Server) handleFileUpload(c echo.Context) error {
	fmt.Println("Handling file upload...")
	fmt.Printf("Content-Type: %s\n", c.Request().Header.Get("Content-Type"))

	// Parse multipart form with 10MB limit
	err := c.Request().ParseMultipartForm(10 << 20)
	if err != nil {
		fmt.Printf("Error parsing multipart form: %v\n", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to parse multipart form")
	}

	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		fmt.Printf("Error getting form file: %v\n", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid file upload")
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read uploaded file")
	}
	defer src.Close()

	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"),
		config.WithClientLogMode(aws.LogRequestWithBody|aws.LogResponseWithBody),
	)
	if err != nil {
		fmt.Printf("Error loading AWS config: %v\n", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load AWS config")
	}

	// Create S3 client with custom endpoint
	bucket := os.Getenv("AWS_S3_BUCKET")
	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.EndpointResolver = s3.EndpointResolverFromURL(fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com", bucket))
		
	})

	// Generate unique file key
	fileExt := filepath.Ext(file.Filename)
	fileKey := fmt.Sprintf("uploads/%d%s", time.Now().UnixNano(), fileExt)

	// Upload to S3
	_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(fileKey),
		Body:        src,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) {
			fmt.Printf("Response error details: %+v\n", apiErr)
		}
		fmt.Printf("Error uploading to S3: %v\n", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to upload to S3")
	}

	// Construct the file URL
	fileURL := fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/%s",
		bucket,
		fileKey)

	fmt.Printf("File uploaded successfully: %s\n", fileURL)
	return c.JSON(http.StatusOK, UploadResponse{
		FileURL: fileURL,
	})
} 