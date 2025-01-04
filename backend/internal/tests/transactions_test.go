package tests

import (
    "context"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "bytes"
    "github.com/google/uuid"
    "fmt"
    "golang.org/x/crypto/bcrypt"
    "time"

    "github.com/labstack/echo/v4"
    "github.com/stretchr/testify/assert"
    "KonferCA/SPUR/internal/server"
    "KonferCA/SPUR/internal/v1/v1_transactions"
	"KonferCA/SPUR/db"
)

func TestTransactionEndpoints(t *testing.T) {
    // Setup test environment
    setupEnv()
    s, err := server.New()
    assert.NoError(t, err)

    ctx := context.Background()

    // Create test user
    userID := uuid.New().String()
    email := fmt.Sprintf("test-%s@mail.com", uuid.New().String())
    password := "password"
    
    // Hash the password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    assert.NoError(t, err)

    // Create investor user directly
    _, err = s.DBPool.Exec(ctx, `
        INSERT INTO users (
            id,
            email, 
            password, 
            role, 
            email_verified, 
            token_salt
        )
        VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))`,
        userID, email, string(hashedPassword), db.UserRoleInvestor, true)
    assert.NoError(t, err)

    // Create test company
    companyID, err := createTestCompany(ctx, s, userID)
    assert.NoError(t, err)

    // Create test project with status
    projectID := uuid.New().String()
    now := time.Now().Unix()

    _, err = s.DBPool.Exec(ctx, `
        INSERT INTO projects (
            id,
            company_id,
            title,
            description,
            status,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        projectID, companyID, "Test Project", "Test Description", db.ProjectStatusPending, now, now)
    assert.NoError(t, err)

    // Get access token
    accessToken := loginAndGetToken(t, s, email, password)

    t.Run("Create Transaction", func(t *testing.T) {
        testCases := []struct {
            name       string
            req       v1_transactions.CreateTransactionRequest
            wantCode  int
            wantError bool
        }{
            {
                name: "valid transaction",
                req: v1_transactions.CreateTransactionRequest{
                    ProjectID:    projectID,
                    TxHash:      "0x1234567890abcdef",
                    FromAddress: "0xabcdef1234567890",
                    ToAddress:   "0x0987654321fedcba",
                    ValueAmount: "1.5",
                },
                wantCode:  http.StatusCreated,
                wantError: false,
            },
            {
                name: "invalid project ID",
                req: v1_transactions.CreateTransactionRequest{
                    ProjectID:    "invalid-uuid",
                    TxHash:      "0x1234567890abcdef",
                    FromAddress: "0xabcdef1234567890",
                    ToAddress:   "0x0987654321fedcba",
                    ValueAmount: "1.5",
                },
                wantCode:  http.StatusBadRequest,
                wantError: true,
            },
            {
                name: "missing required fields",
                req: v1_transactions.CreateTransactionRequest{},
                wantCode:  http.StatusBadRequest,
                wantError: true,
            },
        }

        for _, tc := range testCases {
            t.Run(tc.name, func(t *testing.T) {
                jsonBody, err := json.Marshal(tc.req)
                assert.NoError(t, err)

                req := httptest.NewRequest(http.MethodPost, "/api/v1/transactions", bytes.NewBuffer(jsonBody))
                req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
                req.Header.Set(echo.HeaderAuthorization, "Bearer "+accessToken)

                rec := httptest.NewRecorder()
                s.GetEcho().ServeHTTP(rec, req)

                assert.Equal(t, tc.wantCode, rec.Code)

                if !tc.wantError {
                    var response v1_transactions.TransactionResponse
                    err = json.NewDecoder(rec.Body).Decode(&response)
                    assert.NoError(t, err)
                    assert.NotEmpty(t, response.ID)
                    assert.Equal(t, tc.req.ProjectID, response.ProjectID)
                    assert.Equal(t, companyID, response.CompanyID)
                    assert.Equal(t, tc.req.TxHash, response.TxHash)
                    assert.Equal(t, tc.req.FromAddress, response.FromAddress)
                    assert.Equal(t, tc.req.ToAddress, response.ToAddress)
                    assert.Equal(t, tc.req.ValueAmount, response.ValueAmount)
                }
            })
        }
    })

    // Delete transactions
    _, err = s.DBPool.Exec(ctx, "DELETE FROM transactions WHERE project_id = $1", projectID)
    assert.NoError(t, err)

    // Delete project
    _, err = s.DBPool.Exec(ctx, "DELETE FROM projects WHERE id = $1", projectID)
    assert.NoError(t, err)

    // Delete company
    err = removeTestCompany(ctx, companyID, s)
    assert.NoError(t, err)

    // Delete user
    err = removeTestUser(ctx, email, s)
    assert.NoError(t, err)
}