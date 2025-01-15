package middleware

import (
	"net/http"
	"strings"

	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/permissions"
	"KonferCA/SPUR/internal/v1/v1_common"
	"github.com/google/uuid"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

// CompanyAccess creates a middleware that validates company ownership
func CompanyAccess(dbPool *pgxpool.Pool) echo.MiddlewareFunc {
	queries := db.New(dbPool)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Validate UUID format first
			companyID := c.Param("company_id")
			if _, err := uuid.Parse(companyID); err != nil {
				return v1_common.Fail(c, http.StatusBadRequest, "Invalid company ID format", err)
			}

			// Get user from context (set by Auth middleware)
			user, ok := c.Get("user").(*db.GetUserByIDRow)
			if !ok {
				// This is a true auth error - user not authenticated
				return v1_common.Fail(c, http.StatusUnauthorized, "Authentication required", nil)
			}

			// Check if user is company owner first
			company, err := queries.GetCompanyByID(c.Request().Context(), companyID)
			if err != nil {
				if err.Error() == "no rows in result set" {
					return v1_common.Fail(c, http.StatusNotFound, "Company not found", err)
				}
				return v1_common.Fail(c, http.StatusInternalServerError, "Failed to get company", err)
			}

			// If user is company owner, allow all operations
			if company.OwnerID == user.ID {
				return next(c)
			}

			// For non-owners, check if they have view permissions
			if permissions.HasPermission(uint32(user.Permissions), permissions.PermViewAllProjects) {
				// For GET requests, allow access
				if c.Request().Method == http.MethodGet {
					return next(c)
				}
				// For other methods, return 403 since they can view but not modify
				return v1_common.Fail(c, http.StatusForbidden, "Not authorized to modify this company", nil)
			}

			// User has no access at all, return 404 to hide resource existence
			return v1_common.Fail(c, http.StatusNotFound, "Company not found", nil)
		}
	}
}

// Auth creates a middleware that validates JWT access tokens with required permissions
func Auth(dbPool *pgxpool.Pool, requiredPerms ...uint32) echo.MiddlewareFunc {
	return AuthWithConfig(AuthConfig{
		AcceptTokenType: jwt.ACCESS_TOKEN_TYPE,
		RequiredPermissions: requiredPerms,
	}, dbPool)
}

// AuthWithConfig creates a middleware with custom configuration for JWT validation
func AuthWithConfig(config AuthConfig, dbPool *pgxpool.Pool) echo.MiddlewareFunc {
	queries := db.New(dbPool)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// get the authorization header
			auth := c.Request().Header.Get(echo.HeaderAuthorization)
			if auth == "" {
				return v1_common.Fail(c, http.StatusUnauthorized, "missing authorization header", nil)
			}

			// check bearer format
			parts := strings.Split(auth, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return v1_common.Fail(c, http.StatusUnauthorized, "invalid authorization format", nil)
			}

			// Parse claims without verification first
			claims, err := jwt.ParseUnverifiedClaims(parts[1])
			if err != nil {
				return v1_common.Fail(c, http.StatusUnauthorized, "invalid token", err)
			}

			// Get user's salt from database
			user, err := queries.GetUserByID(c.Request().Context(), claims.UserID)
			if err != nil {
				return v1_common.Fail(c, http.StatusUnauthorized, "invalid token", nil)
			}

			// Verify token with user's salt
			claims, err = jwt.VerifyTokenWithSalt(parts[1], user.TokenSalt)
			if err != nil {
				return v1_common.Fail(c, http.StatusUnauthorized, "invalid token", nil)
			}

			// Verify token type
			if claims.TokenType != config.AcceptTokenType {
				return v1_common.Fail(c, http.StatusUnauthorized, "invalid token type", nil)
			}

			// Verify user permissions if required
			if len(config.RequiredPermissions) > 0 {
				// Convert int32 to uint32 for permissions check
				if !permissions.HasAnyPermission(uint32(user.Permissions), config.RequiredPermissions...) {
					return v1_common.Fail(c, http.StatusForbidden, "Insufficient permissions", nil)
				}
			}

			// store claims and user in context for handlers
			c.Set("claims", &AuthClaims{
				JWTClaims: claims,
				Salt:      user.TokenSalt,
			})
			c.Set("user", &user)

			return next(c)
		}
	}
}

