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
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) setupAuthRoutes() {
	auth := s.apiV1.Group("/auth")
	auth.Use(s.authLimiter.RateLimit()) // special rate limit for auth routes
	auth.POST("/signup", s.handleSignup, mw.ValidateRequestBody(reflect.TypeOf(SignupRequest{})))
	auth.POST("/signin", s.handleSignin, mw.ValidateRequestBody(reflect.TypeOf(SigninRequest{})))
	auth.GET("/verify-email", s.handleVerifyEmail)
	auth.GET("/ami-verified", s.handleEmailVerifiedStatus)
}

func (s *Server) handleSignup(c echo.Context) error {
	var req *SignupRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*SignupRequest)
	if !ok {
		// not good... no bueno
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if err := validateSignupRole(req.Role); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	ctx := c.Request().Context()
	existingUser, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err == nil && existingUser.ID != "" {
		return echo.NewHTTPError(http.StatusConflict, "email already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash password")
	}

	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	// Get user's token salt
	salt, err := s.queries.GetUserTokenSalt(ctx, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user's token salt")
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, salt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	// send verification email
	// db pool is passed to not lose reference to the s object once
	// the function returns the response.
	go func(pool *pgxpool.Pool, email string) {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
		defer cancel()
		q := db.New(pool)
		token, err := q.CreateVerifyEmailToken(ctx, db.CreateVerifyEmailTokenParams{
			Email: email,
			// default expires after 30 minutes
			ExpiresAt: time.Now().Add(time.Minute * 30),
		})
		if err != nil {
			log.Error().Err(err).Str("email", email).Msg("Failed to create verify email token in db.")
			return
		}
		tokenStr, err := jwt.GenerateVerifyEmailToken(email, token.ID, token.ExpiresAt)
		if err != nil {
			log.Error().Err(err).Str("email", email).Msg("Failed to generate signed verify email token.")
			return
		}
		err = service.SendVerficationEmail(ctx, email, tokenStr)
		if err != nil {
			log.Error().Err(err).Str("email", email).Msg("Failed to send verification email.")
			return
		}
	}(s.DBPool, user.Email)

	return c.JSON(http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
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

	// Get user's token salt
	salt, err := s.queries.GetUserTokenSalt(ctx, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user's token salt")
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.Role, salt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
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

// helper function to convert pgtype.Text to *string
func getStringPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}
