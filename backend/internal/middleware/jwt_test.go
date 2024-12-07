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
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockDBTX implements db.DBTX interface
type MockDBTX struct {
	mock.Mock
}

func (m *MockDBTX) Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, nil
}

func (m *MockDBTX) Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
	return nil, nil
}

func (m *MockDBTX) QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row {
	// For GetUserTokenSalt, we'll return a mock row that returns our test salt
	return &mockRow{salt: []byte("test-salt")}
}

// mockRow implements pgx.Row for our test
type mockRow struct {
	salt []byte
}

func (m *mockRow) Scan(dest ...interface{}) error {
	if len(dest) > 0 {
		if p, ok := dest[0].(*[]byte); ok {
			*p = m.salt
			return nil
		}
	}
	return fmt.Errorf("unexpected scan")
}

func TestProtectAPIForAccessToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "secret")
	e := echo.New()
	mockDB := &MockDBTX{}
	queries := db.New(mockDB)

	// Create a middleware instance with the mock
	middleware := ProtectAPI(jwt.ACCESS_TOKEN_TYPE, queries)
	e.Use(middleware)

	e.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// generate valid tokens
	userID := "user-id"
	role := db.UserRole("user-role")
	salt := []byte("test-salt")
	accessToken, refreshToken, err := jwt.GenerateWithSalt(userID, role, salt)
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
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}
}

func TestProtectAPIForRefreshToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "secret")
	e := echo.New()
	mockDB := &MockDBTX{}
	queries := db.New(mockDB)

	// Create a middleware instance with the mock
	middleware := ProtectAPI(jwt.REFRESH_TOKEN_TYPE, queries)
	e.Use(middleware)

	e.GET("/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "protected resource")
	})

	// generate valid tokens
	userID := "user-id"
	role := db.UserRole("user-role")
	salt := []byte("test-salt")
	accessToken, refreshToken, err := jwt.GenerateWithSalt(userID, role, salt)
	assert.Nil(t, err)

	tests := []struct {
		name         string
		expectedCode int
		token        string
	}{
		{
			name:         "Reject access token",
			expectedCode: http.StatusUnauthorized,
			token:        accessToken,
		},
		{
			name:         "Accept refresh token",
			expectedCode: http.StatusOK,
			token:        refreshToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			rec := httptest.NewRecorder()
			req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", test.token))
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedCode, rec.Code)
		})
	}
}
