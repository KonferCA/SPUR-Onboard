package server

import (
	"context"
	"net/http"
	"reflect"
	"time"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	mw "KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/service"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

type SignupResponse struct {
	AccessToken string `json:"access_token"`
	User        User   `json:"user"`
}

type SigninResponse struct {
	AccessToken string `json:"access_token"`
	User        User   `json:"user"`
}

func (s *Server) setupAuthRoutes() {
	auth := s.apiV1.Group("/auth")
	auth.Use(s.authLimiter.RateLimit()) // special rate limit for auth routes
	auth.POST("/signup", s.handleSignup, mw.ValidateRequestBody(reflect.TypeOf(SignupRequest{})))
	auth.POST("/signin", s.handleSignin, mw.ValidateRequestBody(reflect.TypeOf(SigninRequest{})))
	auth.GET("/verify-email", s.handleVerifyEmail)
	auth.GET("/ami-verified", s.handleEmailVerifiedStatus)
	auth.POST("/refresh", s.handleRefreshToken)
	auth.POST("/signout", s.handleSignout)
}

func (s *Server) handleSignup(c echo.Context) error {
	var req *SignupRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*SignupRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if err := validateSignupRole(req.Role); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash password")
	}

	ctx := context.Background()
	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusConflict, "email already exists")
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, user.TokenSalt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate tokens")
	}

	// Set refresh token as HTTP-only cookie
	cookie := new(http.Cookie)
	cookie.Name = "refresh_token"
	cookie.Value = refreshToken
	cookie.HttpOnly = true
	cookie.Secure = true // only send over HTTPS
	cookie.SameSite = http.SameSiteStrictMode
	cookie.Path = "/api/v1/auth" // only accessible by auth endpoints
	cookie.MaxAge = 7 * 24 * 60 * 60 // 7 days in seconds

	c.SetCookie(cookie)

	// Send verification email asynchronously
	go func() {
		token, err := s.queries.CreateVerifyEmailToken(context.Background(), db.CreateVerifyEmailTokenParams{
			Email:     user.Email,
			ExpiresAt: time.Now().Add(30 * time.Minute),
		})
		if err != nil {
			log.Error().Err(err).Msg("Failed to create verification token")
			return
		}

		// Generate JWT for email verification
		tokenStr, err := jwt.GenerateVerifyEmailToken(token.Email, token.ID, token.ExpiresAt)
		if err != nil {
			log.Error().Err(err).Msg("Failed to generate verification token")
			return
		}

		// Send verification email
		if err := service.SendVerficationEmail(context.Background(), user.Email, tokenStr); err != nil {
			log.Error().Err(err).Msg("Failed to send verification email")
			return
		}

		log.Info().Str("token_id", token.ID).Msg("Verification email sent")
	}()

	return c.JSON(http.StatusCreated, SignupResponse{
		AccessToken: accessToken,
		User: User{
			ID:            user.ID,
			Email:         user.Email,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Role:          user.Role,
			WalletAddress: user.WalletAddress,
			EmailVerified: user.EmailVerified,
		},
	})
}

func (s *Server) handleSignin(c echo.Context) error {
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*SigninRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ctx := context.Background()
	user, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, user.TokenSalt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate tokens")
	}

	// Set refresh token as HTTP-only cookie
	cookie := new(http.Cookie)
	cookie.Name = "refresh_token"
	cookie.Value = refreshToken
	cookie.HttpOnly = true
	cookie.Secure = true // only send over HTTPS
	cookie.SameSite = http.SameSiteStrictMode
	cookie.Path = "/api/v1/auth" // only accessible by auth endpoints
	cookie.MaxAge = 7 * 24 * 60 * 60 // 7 days in seconds

	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, SigninResponse{
		AccessToken: accessToken,
		User: User{
			ID:            user.ID,
			Email:         user.Email,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Role:          user.Role,
			WalletAddress: user.WalletAddress,
			EmailVerified: user.EmailVerified,
		},
	})
}

func (s *Server) handleVerifyEmail(c echo.Context) error {
	// TODO: the returns should be a view instead of a normal json
	// or at least redirect the user to the normal looking page

	tokenStr := c.QueryParam("token")

	if tokenStr == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing token in url.")
	}

	claims, err := jwt.VerifyEmailToken(tokenStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid token. Please request a new verification email.")
	}

	q := db.New(s.DBPool)

	// verify existance in the database
	token, err := q.GetVerifyEmailTokenByID(c.Request().Context(), claims.ID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch verify email token from database.")
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to verify email. Please request a new verification email.")
	}

	// match token claims email
	if token.Email != claims.Email {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid token. Please request a new verification email.")
	}

	// find user
	user, err := q.GetUserByEmail(c.Request().Context(), token.Email)
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch user from database.")
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to verify email. Please request a new verification email.")
	}

	// begin a transaction to update user's email status and also delete email token.
	// make sure that both actions are performed and no ambiguous state remains if something goes wrong.
	tx, err := s.DBPool.Begin(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("Failed to begin transaction to update user email verification status.")
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to verify email. Please try again later.")
	}
	defer tx.Rollback(c.Request().Context())

	qtx := q.WithTx(tx)
	err = qtx.UpdateUserEmailVerifiedStatus(c.Request().Context(), db.UpdateUserEmailVerifiedStatusParams{
		EmailVerified: true,
		ID:            user.ID,
	})
	if err != nil {
		log.Error().Err(err).Msg("Failed to update user ")
		return err
	}

	err = qtx.DeleteVerifyEmailTokenByID(c.Request().Context(), token.ID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to update user ")
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to verify email. Please try again later.")
	}

	err = tx.Commit(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("Failed to commit transaction to update user email verification status.")
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to verify email. Please try again later.")
	}

	return c.JSON(http.StatusOK, map[string]bool{
		"success": true,
	})
}

/*
handleEmailVerifiedStatus checks for the email_verified column of the given email.
If the email does not exist in the users table, it returns false. The same goes
for any error encountered.
*/
func (s *Server) handleEmailVerifiedStatus(c echo.Context) error {
	email := c.QueryParam("email")
	if email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing email in query param.")
	}

	user, err := db.New(s.DBPool).GetUserByEmail(c.Request().Context(), email)
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch user when checking email verified status.")
		return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: false})
	}

	return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: user.EmailVerified})
}

func (s *Server) handleRefreshToken(c echo.Context) error {
	// Get refresh token from HTTP-only cookie
	cookie, err := c.Cookie("refresh_token")
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "no refresh token provided")
	}

	// Parse claims without verification to get userID
	unverifiedClaims, err := jwt.ParseUnverifiedClaims(cookie.Value)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token format")
	}

	// Get user's salt from database
	ctx := context.Background()
	salt, err := s.queries.GetUserTokenSalt(ctx, unverifiedClaims.UserID)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Verify the refresh token with user's salt
	claims, err := jwt.VerifyTokenWithSalt(cookie.Value, salt)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Verify it's actually a refresh token
	if claims.TokenType != jwt.REFRESH_TOKEN_TYPE {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token type")
	}

	// Update user's token salt to invalidate old tokens
	if err := s.queries.UpdateUserTokenSalt(ctx, claims.UserID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to rotate token salt")
	}

	// Get the new salt
	newSalt, err := s.queries.GetUserTokenSalt(ctx, claims.UserID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get new token salt")
	}

	// Generate new tokens with the new salt
	accessToken, refreshToken, err := jwt.GenerateWithSalt(claims.UserID, claims.Role, newSalt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate tokens")
	}

	// Set new refresh token cookie
	refreshCookie := new(http.Cookie)
	refreshCookie.Name = "refresh_token"
	refreshCookie.Value = refreshToken
	refreshCookie.HttpOnly = true
	refreshCookie.Secure = true
	refreshCookie.SameSite = http.SameSiteStrictMode
	refreshCookie.Path = "/api/v1/auth"
	refreshCookie.MaxAge = 7 * 24 * 60 * 60 // 7 days

	c.SetCookie(refreshCookie)

	return c.JSON(http.StatusOK, map[string]string{
		"access_token": accessToken,
	})
}

func (s *Server) handleSignout(c echo.Context) error {
	// Create an expired cookie to clear the refresh token
	cookie := new(http.Cookie)
	cookie.Name = "refresh_token"
	cookie.Value = ""
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.SameSite = http.SameSiteStrictMode
	cookie.Path = "/api/v1/auth"
	cookie.MaxAge = -1 // immediately expires the cookie

	c.SetCookie(cookie)
	return c.NoContent(http.StatusOK)
}

// helper function to convert pgtype.Text to *string
func getStringPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}
