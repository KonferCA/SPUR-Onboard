package storage

import (
	"KonferCA/SPUR/common"
	"bytes"
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Storage struct {
	s3Client *s3.Client
	bucket   string
}

// NewStorage creates a new Storage instance with S3 client
func NewStorage() (*Storage, error) {
	bucket := os.Getenv("AWS_S3_BUCKET")
	if bucket == "" {
		return nil, fmt.Errorf("AWS_S3_BUCKET environment variable not set")
	}

	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	var client *s3.Client
	if os.Getenv("APP_ENV") != common.TEST_ENV {
		client = s3.NewFromConfig(cfg)
	} else {
		client = nil
	}

	return &Storage{
		s3Client: client,
		bucket:   bucket,
	}, nil
}

// ValidateFileURL checks if a file URL points to our S3 bucket
func (s *Storage) ValidateFileURL(url string) bool {
	expectedPrefix := fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/", s.bucket)
	return url != "" && len(url) > len(expectedPrefix) && url[:len(expectedPrefix)] == expectedPrefix
}

// GetPresignedURL generates a presigned URL for uploading a file
func (s *Storage) GetPresignedURL(ctx context.Context, key string) (string, error) {
	presignClient := s3.NewPresignClient(s.s3Client)

	putObjectInput := &s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}

	presignedReq, err := presignClient.PresignPutObject(ctx, putObjectInput)
	if err != nil {
		return "", fmt.Errorf("couldn't get presigned URL: %v", err)
	}

	return presignedReq.URL, nil
}

// UploadFile uploads a file to S3 and returns its URL
func (s *Storage) UploadFile(ctx context.Context, key string, data []byte) (string, error) {
	_, err := s.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(data),
	})
	if err != nil {
		return "", fmt.Errorf("couldn't upload file: %v", err)
	}

	return fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/%s", s.bucket, key), nil
}

// DeleteFile deletes a file from S3
func (s *Storage) DeleteFile(ctx context.Context, key string) error {
	_, err := s.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("couldn't delete file: %v", err)
	}

	return nil
}
