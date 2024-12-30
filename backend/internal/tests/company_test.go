package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/server"
	v1 "KonferCA/SPUR/internal/v1"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
)

func TestCompanyEndpoints(t *testing.T) {
	ctx := context.Background()

	setupEnv()
	s, err := server.New()
	require.NoError(t, err)

	v1.SetupRoutes(s)

	ownerID := uuid.New()
	otherOwnerID := uuid.New()
	investorID := uuid.New()
	adminID := uuid.New()

	testUsers := []struct {
		id    uuid.UUID
		email string
		role  db.UserRole
		salt  []byte
		token string
	}{
		{ownerID, "owner@test.com", db.UserRoleStartupOwner, nil, ""},
		{otherOwnerID, "other@test.com", db.UserRoleStartupOwner, nil, ""},
		{investorID, "investor@test.com", db.UserRoleInvestor, nil, ""},
		{adminID, "admin@test.com", db.UserRoleAdmin, nil, ""},
	}

	for i := range testUsers {
		var salt []byte
		err := s.GetDB().QueryRow(ctx, `
			WITH inserted AS (
				INSERT INTO users (id, email, password, role, email_verified, token_salt)
				VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
				RETURNING token_salt
			)
			SELECT token_salt FROM inserted
		`, testUsers[i].id, testUsers[i].email, "hashedpass", testUsers[i].role, true).Scan(&salt)
		require.NoError(t, err)

		testUsers[i].salt = salt
		token, _, err := jwt.GenerateWithSalt(testUsers[i].id.String(), testUsers[i].role, salt)
		require.NoError(t, err)
		testUsers[i].token = token
	}

	e := s.GetEcho()

	t.Run("Create Company", func(t *testing.T) {
		testCases := []struct {
			name     string
			token    string
			request  map[string]interface{}
			wantCode int
		}{
			{
				name:  "Valid company creation",
				token: testUsers[0].token,
				request: map[string]interface{}{
					"name":           "Test Company",
					"wallet_address": "0x1234567890123456789012345678901234567890123456789012345678901234",
					"linkedin_url":   "https://linkedin.com/company/test",
				},
				wantCode: http.StatusCreated,
			},
			{
				name:  "Invalid wallet address",
				token: testUsers[1].token,
				request: map[string]interface{}{
					"name":           "Bad Wallet",
					"wallet_address": "invalid",
					"linkedin_url":   "https://linkedin.com/company/test",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:  "Invalid LinkedIn URL",
				token: testUsers[1].token,
				request: map[string]interface{}{
					"name":           "Bad LinkedIn",
					"wallet_address": "0x1234567890123456789012345678901234567890123456789012345678901234",
					"linkedin_url":   "https://invalid.com",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:  "Investor cannot create company",
				token: testUsers[2].token,
				request: map[string]interface{}{
					"name":         "Investor Company",
					"linkedin_url": "https://linkedin.com/company/test",
				},
				wantCode: http.StatusForbidden,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				jsonBody, err := json.Marshal(tc.request)
				require.NoError(t, err)

				req := httptest.NewRequest(http.MethodPost, "/api/v1/company/new", bytes.NewBuffer(jsonBody))
				req.Header.Set(echo.HeaderContentType, "application/json")
				req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", tc.token))

				rec := httptest.NewRecorder()
				e.ServeHTTP(rec, req)

				require.Equal(t, tc.wantCode, rec.Code)

				if tc.wantCode == http.StatusCreated {
					var response map[string]interface{}
					err = json.Unmarshal(rec.Body.Bytes(), &response)
					require.NoError(t, err)
					require.Equal(t, tc.request["name"], response["name"])
					require.Equal(t, tc.request["linkedin_url"], response["linkedin_url"])
					if tc.request["wallet_address"] != nil {
						require.Equal(t, tc.request["wallet_address"], response["wallet_address"])
					}
				}
			})
		}
	})

	t.Run("Get Company", func(t *testing.T) {
		companyID := uuid.New()
		now := time.Now().Unix()
		_, err := s.GetDB().Exec(ctx, `
			INSERT INTO companies (
				id,
				owner_id, 
				name, 
				linkedin_url, 
				wallet_address, 
				created_at, 
				updated_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $6)
		`,
			companyID,
			ownerID.String(),
			"Test Company",
			"https://linkedin.com/company/test",
			"0x1234567890123456789012345678901234567890123456789012345678901234",
			now,
		)
		require.NoError(t, err)

		var storedCompany db.Company
		err = s.GetDB().QueryRow(ctx, `
			SELECT id, owner_id, name, linkedin_url, wallet_address, created_at, updated_at 
			FROM companies 
			WHERE id = $1
		`, companyID).Scan(
			&storedCompany.ID,
			&storedCompany.OwnerID,
			&storedCompany.Name,
			&storedCompany.LinkedinUrl,
			&storedCompany.WalletAddress,
			&storedCompany.CreatedAt,
			&storedCompany.UpdatedAt,
		)
		require.NoError(t, err)

		testCases := []struct {
			name      string
			token     string
			userID    uuid.UUID
			wantCode  int
			urlSuffix string
		}{
			{
				name:      "Owner can get own company",
				token:     testUsers[0].token,
				userID:    ownerID,
				wantCode:  http.StatusOK,
				urlSuffix: "",
			},
			{
				name:      "Admin can view company by ID",
				token:     testUsers[3].token,
				userID:    adminID,
				wantCode:  http.StatusOK,
				urlSuffix: "/" + storedCompany.ID,
			},
			{
				name:      "Other owner cannot access company",
				token:     testUsers[1].token,
				userID:    otherOwnerID,
				wantCode:  http.StatusNotFound,
				urlSuffix: "",
			},
			{
				name:      "Investor cannot access company",
				token:     testUsers[2].token,
				userID:    investorID,
				wantCode:  http.StatusForbidden,
				urlSuffix: "",
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				req := httptest.NewRequest(http.MethodGet, "/api/v1/company"+tc.urlSuffix, nil)
				req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", tc.token))

				rec := httptest.NewRecorder()
				e.ServeHTTP(rec, req)

				require.Equal(t, tc.wantCode, rec.Code)

				if tc.wantCode == http.StatusOK {
					var response map[string]interface{}
					err = json.Unmarshal(rec.Body.Bytes(), &response)
					require.NoError(t, err)

					require.Equal(t, storedCompany.ID, response["id"])
					require.Equal(t, storedCompany.OwnerID, response["owner_id"])
					require.Equal(t, storedCompany.Name, response["name"])
					require.Equal(t, storedCompany.LinkedinUrl, response["linkedin_url"])
					require.Equal(t, *storedCompany.WalletAddress, response["wallet_address"])
				}
			})
		}

		_, err = s.GetDB().Exec(ctx, "DELETE FROM companies WHERE id = $1", companyID)
		require.NoError(t, err)
	})

	t.Run("Update Company", func(t *testing.T) {
		testCases := []struct {
			name     string
			token    string
			request  map[string]interface{}
			wantCode int
		}{
			{
				name:  "Owner can update company",
				token: testUsers[0].token,
				request: map[string]interface{}{
					"name":           "Updated Company",
					"wallet_address": "0x9876543210987654321098765432109876543210987654321098765432109876",
					"linkedin_url":   "https://linkedin.com/company/updated",
				},
				wantCode: http.StatusOK,
			},
			{
				name:  "Invalid wallet address",
				token: testUsers[0].token,
				request: map[string]interface{}{
					"wallet_address": "invalid",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:  "Invalid LinkedIn URL",
				token: testUsers[0].token,
				request: map[string]interface{}{
					"linkedin_url": "https://invalid.com",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:  "Other owner cannot update",
				token: testUsers[1].token,
				request: map[string]interface{}{
					"name": "Unauthorized Update",
				},
				wantCode: http.StatusNotFound,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				jsonBody, err := json.Marshal(tc.request)
				require.NoError(t, err)

				req := httptest.NewRequest(http.MethodPut, "/api/v1/company", bytes.NewBuffer(jsonBody))
				req.Header.Set(echo.HeaderContentType, "application/json")
				req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", tc.token))

				rec := httptest.NewRecorder()
				e.ServeHTTP(rec, req)

				require.Equal(t, tc.wantCode, rec.Code)

				if tc.wantCode == http.StatusOK {
					var response map[string]interface{}
					err = json.Unmarshal(rec.Body.Bytes(), &response)
					require.NoError(t, err)

					if tc.request["name"] != nil {
						require.Equal(t, tc.request["name"], response["name"])
					}
					if tc.request["wallet_address"] != nil {
						require.Equal(t, tc.request["wallet_address"], response["wallet_address"])
					}
					if tc.request["linkedin_url"] != nil {
						require.Equal(t, tc.request["linkedin_url"], response["linkedin_url"])
					}
				}
			})
		}
	})

	_, err = s.GetDB().Exec(ctx, "DELETE FROM companies")
	require.NoError(t, err)
	_, err = s.GetDB().Exec(ctx, "DELETE FROM users")
	require.NoError(t, err)
}
