package middleware

import (
    "context"
    "fmt"
    "net/http"
    "net/http/httptest"
    "os"
    "testing"

    "KonferCA/SPUR/db"
    "KonferCA/SPUR/internal/jwt"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/labstack/echo/v4"
    "github.com/stretchr/testify/assert"
)

func TestProtectAPIForAccessToken(t *testing.T) {
    // setup test environment
    os.Setenv("JWT_SECRET", "secret")
    
    // Connect to test database
    ctx := context.Background()
    dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
        "postgres",
        "postgres",
        "localhost",
        "5432",
        "postgres",
        "disable",
    )
    
    dbPool, err := pgxpool.New(ctx, dbURL)
    if err != nil {
        t.Fatalf("failed to connect to database: %v", err)
    }
    defer dbPool.Close()

    // Clean up any existing test user
    _, err = dbPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
    if err != nil {
        t.Fatalf("failed to clean up test user: %v", err)
    }

    // Create a test user directly in the database
    userID := uuid.New().String()
    _, err = dbPool.Exec(ctx, `
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, token_salt)
        VALUES ($1, $2, $3, $4, $5, 'startup_owner', gen_random_bytes(32))
    `, userID, "test@example.com", "hashedpassword", "Test", "User")
    if err != nil {
        t.Fatalf("failed to create test user: %v", err)
    }

    // Create Echo instance with the DB connection
    e := echo.New()
    queries := db.New(dbPool)
    middleware := ProtectAPI(jwt.ACCESS_TOKEN_TYPE, queries)
    e.Use(middleware)

    e.GET("/protected", func(c echo.Context) error {
        return c.String(http.StatusOK, "protected resource")
    })

    // Get test user data from the database
    user, err := queries.GetUserByEmail(ctx, "test@example.com")
    if err != nil {
        t.Fatalf("failed to get test user: %v", err)
    }

    // Get the user's salt
    var salt []byte
    err = dbPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE id = $1", user.ID).Scan(&salt)
    if err != nil {
        t.Fatalf("failed to get user salt: %v", err)
    }

    // generate valid tokens using the actual salt
    accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, salt)
    assert.Nil(t, err)

    tests := []struct {
        name         string
        expectedCode int
        token        string
    }{
        {
            name:         "Accept access token",
            expectedCode: http.StatusOK,
            token:        accessToken,
        },
        {
            name:         "Reject refresh token",
            expectedCode: http.StatusUnauthorized,
            token:        refreshToken,
        },
        {
            name:         "Reject invalid token format",
            expectedCode: http.StatusUnauthorized,
            token:        "invalid-token",
        },
        {
            name:         "Reject empty token",
            expectedCode: http.StatusUnauthorized,
            token:        "",
        },
        {
            name:         "Reject token with invalid signature",
            expectedCode: http.StatusUnauthorized,
            token:        accessToken + "tampered",
        },
    }

    for _, test := range tests {
        t.Run(test.name, func(t *testing.T) {
            req := httptest.NewRequest(http.MethodGet, "/protected", nil)
            rec := httptest.NewRecorder()
            if test.token != "" {
                req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
            }
            e.ServeHTTP(rec, req)
            assert.Equal(t, test.expectedCode, rec.Code)
        })
    }

    // Clean up test user after test
    _, err = dbPool.Exec(ctx, "DELETE FROM users WHERE email = $1", "test@example.com")
    if err != nil {
        t.Fatalf("failed to clean up test user: %v", err)
    }
}