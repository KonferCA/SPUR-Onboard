package server

import (
	"net/http"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateTag(c echo.Context) error {
	var req *CreateTagRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateTagRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	tag, err := queries.CreateTag(ctx, req.Name)
	if err != nil {
		return handleDBError(err, "create", "tag")
	}

	return c.JSON(http.StatusCreated, tag)
}

func (s *Server) handleGetTag(c echo.Context) error {
	tagID, err := validateUUID(c.Param("id"), "tag")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	tag, err := queries.GetTag(ctx, tagID)
	if err != nil {
		return handleDBError(err, "fetch", "tag")
	}

	return c.JSON(http.StatusOK, tag)
}

func (s *Server) handleListTags(c echo.Context) error {
	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	tags, err := queries.ListTags(ctx)
	if err != nil {
		return handleDBError(err, "fetch", "tags")
	}

	return c.JSON(http.StatusOK, tags)
}

func (s *Server) handleDeleteTag(c echo.Context) error {
	tagID, err := validateUUID(c.Param("id"), "tag")
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	queries := db.New(s.DBPool)

	err = queries.DeleteTag(ctx, tagID)
	if err != nil {
		return handleDBError(err, "delete", "tag")
	}

	return c.NoContent(http.StatusNoContent)
}
