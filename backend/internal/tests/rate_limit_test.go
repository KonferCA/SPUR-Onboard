package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"KonferCA/SPUR/internal/middleware"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRateLimiter(t *testing.T) {
	t.Run("allows requests within limit", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)

		limiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
			Requests:    2,
			Window:      100 * time.Millisecond,
			BlockPeriod: 200 * time.Millisecond,
			MaxBlocks:   2,
		})

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		h := limiter.RateLimit()(handler)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		err = h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("blocks requests over limit", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-Real-IP", "192.168.1.100")

		limiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
			Requests:    1,
			Window:      100 * time.Millisecond,
			BlockPeriod: 200 * time.Millisecond,
			MaxBlocks:   2,
		})

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		h := limiter.RateLimit()(handler)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := h(c)
		assert.NoError(t, err)

		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		err = h(c)
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusTooManyRequests, he.Code)
	})

	t.Run("handles multiple IPs independently", func(t *testing.T) {
		e := echo.New()
		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		limiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
			Requests:    1,
			Window:      100 * time.Millisecond,
			BlockPeriod: 200 * time.Millisecond,
			MaxBlocks:   2,
		})

		h := limiter.RateLimit()(handler)

		ips := []string{"192.168.1.1", "192.168.1.2"}
		for _, ip := range ips {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("X-Real-IP", ip)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)

			rec = httptest.NewRecorder()
			c = e.NewContext(req, rec)
			err = h(c)
			he, ok := err.(*echo.HTTPError)
			assert.True(t, ok)
			assert.Equal(t, http.StatusTooManyRequests, he.Code)
		}
	})

	t.Run("allows requests after window reset", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-Real-IP", "192.168.1.200")

		limiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
			Requests:    1,
			Window:      100 * time.Millisecond,
			BlockPeriod: 50 * time.Millisecond,
			MaxBlocks:   2,
		})

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		h := limiter.RateLimit()(handler)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		err = h(c)
		assert.Error(t, err)
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusTooManyRequests, he.Code)

		time.Sleep(150 * time.Millisecond)

		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		err = h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("applies progressive blocking", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-Real-IP", "192.168.1.300")

		limiter := middleware.NewRateLimiter(&middleware.RateLimiterConfig{
			Requests:    1,
			Window:      50 * time.Millisecond,
			BlockPeriod: 100 * time.Millisecond,
			MaxBlocks:   2,
		})

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		h := limiter.RateLimit()(handler)

		for i := 1; i <= 2; i++ {
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)

			rec = httptest.NewRecorder()
			c = e.NewContext(req, rec)
			err = h(c)
			assert.Error(t, err)
			he, ok := err.(*echo.HTTPError)
			assert.True(t, ok)
			assert.Equal(t, http.StatusTooManyRequests, he.Code)

			time.Sleep(time.Duration(i) * 150 * time.Millisecond)
		}
	})
}
