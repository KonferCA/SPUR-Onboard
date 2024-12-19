package v1_common

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRequestResponders(t *testing.T) {
	t.Run("Test success responder", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := Success(c, http.StatusOK, "test")
		assert.NoError(t, err)
		data, err := io.ReadAll(rec.Body)
		assert.NoError(t, err)
		var resBody basicResponse
		err = json.Unmarshal(data, &resBody)
		assert.NoError(t, err)
		assert.Equal(t, rec.Code, http.StatusOK)
		assert.Equal(t, resBody, basicResponse{Message: "test"})
	})

	t.Run("Test success responder with empty message", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := Success(c, http.StatusOK, "")
		assert.NoError(t, err)
		data, err := io.ReadAll(rec.Body)
		assert.NoError(t, err)
		var resBody basicResponse
		err = json.Unmarshal(data, &resBody)
		assert.NoError(t, err)
		assert.Equal(t, rec.Code, http.StatusOK)
		assert.Equal(t, resBody, basicResponse{Message: http.StatusText(http.StatusOK)})
	})

	t.Run("Test fail responder", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		testErr := errors.New("test-error")
		err, ok := Fail(c, http.StatusBadRequest, "test", testErr).(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, err.Code, http.StatusBadRequest)
		assert.Equal(t, err.Message, "test")
		contextErr, ok := c.Get("internal_error").(error)
		assert.True(t, ok)
		assert.Equal(t, contextErr, testErr)
	})

	t.Run("Test fail responder with empty message", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		testErr := errors.New("test-error")
		err, ok := Fail(c, http.StatusBadRequest, "", testErr).(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, err.Code, http.StatusBadRequest)
		assert.Equal(t, err.Message, http.StatusText(http.StatusBadRequest))
		contextErr, ok := c.Get("internal_error").(error)
		assert.True(t, ok)
		assert.Equal(t, contextErr, testErr)
	})

	t.Run("Test fail responder with nil error", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err, ok := Fail(c, http.StatusBadRequest, "", nil).(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, err.Code, http.StatusBadRequest)
		assert.Equal(t, err.Message, http.StatusText(http.StatusBadRequest))
		contextErr, ok := c.Get("internal_error").(error)
		assert.False(t, ok)
		assert.Equal(t, contextErr, nil)
	})
}
