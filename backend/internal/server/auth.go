package server

import (
	"context"
	"net/http"
	"reflect"

	"github.com/KonferCA/NoKap/db"
	"github.com/KonferCA/NoKap/internal/jwt"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) setupAuthRoutes() {
	auth := s.apiV1.Group("/auth")
	auth.Use(s.authLimiter.RateLimit()) // special rate limit for auth routes
	auth.POST("/signup", s.handleSignup, mw.ValidateRequestBody(reflect.TypeOf(SignupRequest{})))
	auth.POST("/signin", s.handleSignin, mw.ValidateRequestBody(reflect.TypeOf(SigninRequest{})))
}

func (s *Server) handleSignup(c echo.Context) error {
	var req *SignupRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*SignupRequest)
	if !ok {
		// not good... no bueno
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
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
		FirstName:    &req.FirstName,
		LastName:     &req.LastName,
		Role:         req.Role,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	accessToken, refreshToken, err := jwt.Generate(user.ID, user.Role)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	return c.JSON(http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: User{
			ID:            user.ID,
			Email:         user.Email,
			FirstName:     *user.FirstName,
			LastName:      *user.LastName,
			Role:          user.Role,
			WalletAddress: user.WalletAddress,
		},
	})
}

func (s *Server) handleSignin(c echo.Context) error {
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*SigninRequest)
	if !ok {
		// no bueno...
		// should never really reach this state since the validator should reject
		// the request body if it is not a proper SigninRequest type
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

	accessToken, refreshToken, err := jwt.Generate(user.ID, user.Role)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: User{
			ID:            user.ID,
			Email:         user.Email,
			FirstName:     *user.FirstName,
			LastName:      *user.LastName,
			Role:          user.Role,
			WalletAddress: user.WalletAddress,
		},
	})
}

// helper function to convert pgtype.Text to *string
func getStringPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}
