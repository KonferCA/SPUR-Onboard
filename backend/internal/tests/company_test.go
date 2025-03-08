package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/server"
	v1 "KonferCA/SPUR/internal/v1"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
)

type CompanyState struct {
	ID            string
	OwnerID       string
	Name          string
	WalletAddress string
	LinkedinUrl   string
	CreatedAt     int64
	UpdatedAt     int64
}

type testUser struct {
	id          uuid.UUID
	email       string
	permissions uint32
	salt        []byte
	token       string
}

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

	testUsers := []testUser{
		{ownerID, "owner@test.com", permissions.PermStartupOwner | permissions.PermSubmitProject | permissions.PermManageTeam, nil, ""},
		{otherOwnerID, "other@test.com", permissions.PermStartupOwner | permissions.PermSubmitProject | permissions.PermManageTeam, nil, ""},
		{investorID, "investor@test.com", permissions.PermInvestor, nil, ""},
		{adminID, "admin@test.com", permissions.PermAdmin | permissions.PermManageUsers | permissions.PermViewAllProjects | permissions.PermManageTeam, nil, ""},
	}

	for i := range testUsers {
		var salt []byte
		err := s.GetDB().QueryRow(ctx, `
			WITH inserted AS (
				INSERT INTO users (id, email, password, permissions, email_verified, token_salt)
				VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))
				RETURNING token_salt
			)
			SELECT token_salt FROM inserted
		`, testUsers[i].id, testUsers[i].email, "hashedpass", int32(testUsers[i].permissions), true).Scan(&salt)
		require.NoError(t, err)

		testUsers[i].salt = salt
		accessToken, _, err := jwt.GenerateWithSalt(testUsers[i].id.String(), salt)
		require.NoError(t, err)
		testUsers[i].token = accessToken
	}

	e := s.GetEcho()

	companies := make(map[string]CompanyState)

	t.Run("Create Company", func(t *testing.T) {
		testCases := []struct {
			name     string
			token    string
			userID   string
			request  map[string]interface{}
			wantCode int
		}{
			{
				name:   "Valid company creation",
				token:  testUsers[0].token,
				userID: ownerID.String(),
				request: map[string]interface{}{
					"name":           "Test Company",
					"wallet_address": "0x1234567890123456789012345678901234567890123456789012345678901234",
					"linkedin_url":   "https://linkedin.com/company/test",
					"date_founded":   time.Now().Unix(),
					"stages":         []string{"Ideation"},
				},
				wantCode: http.StatusCreated,
			},
			{
				name:   "Invalid wallet address",
				token:  testUsers[1].token,
				userID: otherOwnerID.String(),
				request: map[string]interface{}{
					"name":           "Bad Wallet",
					"wallet_address": "invalid",
					"linkedin_url":   "https://linkedin.com/company/test",
					"date_founded":   time.Now().Unix(),
					"stages":         []string{"Ideation"},
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:   "Invalid LinkedIn URL",
				token:  testUsers[1].token,
				userID: otherOwnerID.String(),
				request: map[string]interface{}{
					"name":           "Bad LinkedIn",
					"wallet_address": "0x1234567890123456789012345678901234567890123456789012345678901234",
					"linkedin_url":   "https://invalid.com",
					"date_founded":   time.Now().Unix(),
					"stages":         []string{"Ideation"},
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:   "Investor cannot create company",
				token:  testUsers[2].token,
				userID: investorID.String(),
				request: map[string]interface{}{
					"name":         "Investor Company",
					"linkedin_url": "https://linkedin.com/company/test",
					"date_founded": time.Now().Unix(),
					"stages":       []string{"Ideation"},
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

					companies[tc.userID] = CompanyState{
						ID:            response["id"].(string),
						OwnerID:       response["owner_id"].(string),
						Name:          response["name"].(string),
						WalletAddress: response["wallet_address"].(string),
						LinkedinUrl:   response["linkedin_url"].(string),
						CreatedAt:     int64(response["created_at"].(float64)),
						UpdatedAt:     int64(response["updated_at"].(float64)),
					}

					t.Logf("Created company for owner %s: %+v", tc.userID, companies[tc.userID])

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
				urlSuffix: "/admin/" + companies[ownerID.String()].ID,
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

					expectedCompany := companies[ownerID.String()]

					t.Logf("Comparing - Expected Company: %+v", expectedCompany)
					t.Logf("Response body: %+v", response)

					require.Equal(t, expectedCompany.ID, response["id"])
					require.Equal(t, expectedCompany.OwnerID, response["owner_id"])
					require.Equal(t, expectedCompany.Name, response["name"])
					require.Equal(t, expectedCompany.LinkedinUrl, response["linkedin_url"])
					require.Equal(t, expectedCompany.WalletAddress, response["wallet_address"])
				}
			})
		}
	})

	t.Run("Update Company", func(t *testing.T) {
		testCases := []struct {
			name     string
			token    string
			userID   string
			request  map[string]interface{}
			wantCode int
		}{
			{
				name:   "Valid company update",
				token:  testUsers[0].token,
				userID: ownerID.String(),
				request: map[string]interface{}{
					"name":           "Updated Company",
					"wallet_address": "0x9876543210987654321098765432109876543210987654321098765432109876",
					"linkedin_url":   "https://linkedin.com/company/updated",
					"date_founded":   time.Now().Unix(),
					"stages":         []string{"Growth"},
				},
				wantCode: http.StatusOK,
			},
			{
				name:   "Invalid wallet address",
				token:  testUsers[0].token,
				userID: ownerID.String(),
				request: map[string]interface{}{
					"wallet_address": "invalid",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:   "Invalid LinkedIn URL",
				token:  testUsers[0].token,
				userID: ownerID.String(),
				request: map[string]interface{}{
					"linkedin_url": "https://invalid.com",
				},
				wantCode: http.StatusBadRequest,
			},
			{
				name:   "Other owner cannot update",
				token:  testUsers[1].token,
				userID: otherOwnerID.String(),
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

					companies[tc.userID] = CompanyState{
						ID:            response["id"].(string),
						OwnerID:       response["owner_id"].(string),
						Name:          response["name"].(string),
						WalletAddress: response["wallet_address"].(string),
						LinkedinUrl:   response["linkedin_url"].(string),
						CreatedAt:     int64(response["created_at"].(float64)),
						UpdatedAt:     int64(response["updated_at"].(float64)),
					}

					t.Logf("Updated company for owner %s: %+v", tc.userID, companies[tc.userID])

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
