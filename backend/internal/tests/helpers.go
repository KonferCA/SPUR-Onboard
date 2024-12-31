package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/server"
	"context"
	"time"
	"fmt"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

/*
Creates a simple test user in the database. Remember to remove the test user with removeTestUser().

The function returns userID, email, password, error
*/
func createTestUser(ctx context.Context, s *server.Server) (string, string, string, error) {
	userID := uuid.New().String()
	email := fmt.Sprintf("test-%s@mail.com", uuid.New().String())
	password := "password"
	
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", "", err
	}

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
		userID, email, string(hashedPassword), db.UserRoleStartupOwner, false)
	
	return userID, email, password, err
}

/*
Helper function that queries the token_salt of a test user with email.
*/
func getTestUserTokenSalt(ctx context.Context, email string, s *server.Server) ([]byte, error) {
	row := s.DBPool.QueryRow(ctx, "SELECT token_salt FROM users WHERE email = $1;", email)
	var salt []byte
	err := row.Scan(&salt)
	return salt, err
}

/*
Simple wrapper with SQL to remove a user from the database. Ideally, you want to use this
only for the test user created by the function createTestUser()
*/
func removeTestUser(ctx context.Context, email string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM users WHERE email = $1", email)
	return err
}

/*
Simple helper function that creates a test email token. Remember to call removeTestEmailToken()
if the test doesn't remove it by default, such as the verify email handler.
*/
func createTestEmailToken(ctx context.Context, userID string, exp time.Time, s *server.Server) (string, error) {
	row := s.DBPool.QueryRow(ctx, `
        INSERT INTO verify_email_tokens (
            user_id, 
            expires_at
        )
        VALUES ($1, $2) RETURNING id;`,
		userID, exp.Unix())
	var tokenID string
	err := row.Scan(&tokenID)
	return tokenID, err
}

/*
Simple wrapper that removes the test email token. Only call this function if the
token hasn't been removed by other functions.
*/
func removeEmailToken(ctx context.Context, tokenID string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM verify_email_tokens WHERE id = $1", tokenID)
	return err
}

/*
Creates a test company for the given user. Remember to clean up after tests.
Returns companyID, error
*/
func createTestCompany(ctx context.Context, s *server.Server, userID string) (string, error) {
	companyID := uuid.New().String()
	
	_, err := s.DBPool.Exec(ctx, `
		INSERT INTO companies (
			id,
			name,
			wallet_address,
			linkedin_url,
			owner_id
		)
		VALUES ($1, $2, $3, $4, $5)`,
		companyID, "Test Company", "0x123", "https://linkedin.com/test", userID)
	
	return companyID, err
}

/*
Removes a test company from the database.
*/
func removeTestCompany(ctx context.Context, companyID string, s *server.Server) error {
	_, err := s.DBPool.Exec(ctx, "DELETE FROM companies WHERE id = $1", companyID)
	return err
}
