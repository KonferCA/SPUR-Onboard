package server

import (
	"context"
	"net/http"

	"KonferCA/SPUR/db"
	mw "KonferCA/SPUR/internal/middleware"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateUserProfile(c echo.Context) error {
	var req *CreateUserProfileRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateUserProfileRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	userID := c.Get("user_id").(string)
	userUUID, err := validateUUID(userID, "user")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetUserProfileByUserID(context.Background(), userUUID)
	if err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Profile already exists for this user")
	} else if err != pgx.ErrNoRows {
		return handleDBError(err, "verify", "user profile")
	}

	params := db.CreateUserProfileParams{
		UserID:            userUUID,
		FirstName:         req.FirstName,
		LastName:          req.LastName,
		Position:          req.Position,
		Role:              db.UserRole(req.Role),
		Bio:               req.Bio,
		Expertise:         req.Expertise,
		IsProfileComplete: true,
	}

	profile, err := queries.CreateUserProfile(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "user profile")
	}

	return c.JSON(http.StatusCreated, profile)
}

func (s *Server) handleGetUserProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)
	userUUID, err := validateUUID(userID, "user")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	profile, err := queries.GetUserProfileByUserID(context.Background(), userUUID)
	if err != nil {
		return handleDBError(err, "fetch", "user profile")
	}

	return c.JSON(http.StatusOK, profile)
}

func (s *Server) handleListUserProfiles(c echo.Context) error {
	queries := db.New(s.DBPool)

	role := c.QueryParam("role")
	page := getPageParam(c)
	limit := getLimitParam(c)
	offset := (page - 1) * limit

	var profiles interface{}
	var err error

	if role != "" {
		params := db.ListUserProfilesByRoleParams{
			Role:   db.UserRole(role),
			Limit:  int32(limit),
			Offset: int32(offset),
		}

		profiles, err = queries.ListUserProfilesByRole(context.Background(), params)
	} else {
		params := db.ListAllCompleteProfilesParams{
			Limit:  int32(limit),
			Offset: int32(offset),
		}

		profiles, err = queries.ListAllCompleteProfiles(context.Background(), params)
	}

	if err != nil {
		return handleDBError(err, "fetch", "user profiles")
	}

	return c.JSON(http.StatusOK, profiles)
}

func (s *Server) handleUpdateUserProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)
	userUUID, err := validateUUID(userID, "user")
	if err != nil {
		return err
	}

	var req *UpdateUserProfileRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateUserProfileRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	queries := db.New(s.DBPool)

	currentProfile, err := queries.GetUserProfileByUserID(context.Background(), userUUID)
	if err != nil {
		return handleDBError(err, "verify", "user profile")
	}

	params := db.UpdateUserProfileParams{
		UserID:            userUUID,
		FirstName:         req.FirstName,
		LastName:          req.LastName,
		Position:          req.Position,
		Role:              currentProfile.Role,
		Bio:               req.Bio,
		Expertise:         req.Expertise,
		IsProfileComplete: true,
	}

	profile, err := queries.UpdateUserProfile(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "user profile")
	}

	return c.JSON(http.StatusOK, profile)
}

func (s *Server) handleDeleteUserProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)
	userUUID, err := validateUUID(userID, "user")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetUserProfileByUserID(context.Background(), userUUID)
	if err != nil {
		return handleDBError(err, "verify", "user profile")
	}

	err = queries.DeleteUserProfile(context.Background(), userUUID)
	if err != nil {
		return handleDBError(err, "delete", "user profile")
	}

	return c.NoContent(http.StatusNoContent)
}
