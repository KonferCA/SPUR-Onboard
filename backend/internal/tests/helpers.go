package tests

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/server"
	"context"
	"time"

	"github.com/google/uuid"
)

/*
Creates a simple test user in the database. Remember to remove the test user with removeTestUser().

The function returns userID, email, password, error
*/
func createTestUser(ctx context.Context, s *server.Server) (string, string, string, error) {
	userID := uuid.New().String()
	email := "test@mail.com"
	password := "password"
	_, err := s.DBPool.Exec(ctx, `
                INSERT INTO users (
                    id,
                    email, 
                    password, 
                    role, 
                    email_verified, 
                    token_salt
                )
                VALUES ($1, $2, $3, $4, $5, gen_random_bytes(32))`,
		userID, email, "hashedpassword", db.UserRoleStartupOwner, false)
	return userID, email, password, err
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
