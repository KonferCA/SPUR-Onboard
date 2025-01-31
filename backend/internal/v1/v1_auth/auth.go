package v1_auth

import (
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/internal/service"
	"KonferCA/SPUR/internal/v1/v1_common"
	"KonferCA/SPUR/internal/views"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"

	"KonferCA/SPUR/internal/permissions"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

const (
	// Name of the cookie that holds the refresh token.
	COOKIE_REFRESH_TOKEN string = "refresh_token"
)

// verify password hash using bcrypt
func verifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

/*
Helper function that sends a new verification email. It can be use to send new verification emails
or for resending the verification email to the same recipient again.

Keep in mind that the recipient must be the same user.
*/
func sendEmailVerification(userID, email string, queries *db.Queries) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	exists, err := queries.ExistsVerifyEmailTokenByUserID(ctx, userID)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Str("email", email).Msg("Failed to send verification email.")
		return
	}

	if exists {
		// remove existing one
		err := queries.RemoveVerifyEmailTokenByUserID(ctx, userID)
		if err != nil {
			log.Error().Err(err).Str("user_id", userID).Str("email", email).Msg("Failed to send verification email.")
			return
		}
	}

	exp := time.Now().Add(time.Minute * 30).UTC()
	tokenID, err := queries.NewVerifyEmailToken(ctx, db.NewVerifyEmailTokenParams{
		UserID:    userID,
		ExpiresAt: exp.Unix(),
	})
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Str("email", email).Msg("Failed to send verification email.")
		return
	}

	emailToken, err := jwt.GenerateVerifyEmailToken(email, tokenID, exp)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Str("email", email).Msg("Failed to send verification email.")
		return
	}

	err = service.SendVerficationEmail(ctx, email, emailToken)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Str("email", email).Msg("Failed to send verification email.")
		return
	}
}

/*
Simple route handler that just returns whether the email has been verified or not in JSON body.
*/
func (h *Handler) handleEmailVerificationStatus(c echo.Context) error {
	user, ok := c.Get("user").(*db.User)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("Failed to cast user type from context that should have been set by Auth middleware."))
	}

	return c.JSON(http.StatusOK, EmailVerifiedStatusResponse{Verified: user.EmailVerified})
}

/*
Route handles incoming requests to register/create a new account.
- Allow if the email is valid
- Allow if no other user has the same email already
- Responds with the access token and basic user information upon success
- HTTP-only cookie is also set with the refresh token value
*/
func (h *Handler) handleRegister(c echo.Context) error {
	logger := middleware.GetLogger(c)

	var reqBody AuthRequest
	if err := c.Bind(&reqBody); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}
	if err := c.Validate(&reqBody); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	q := h.server.GetQueries()

	exists, err := q.UserExistsByEmail(ctx, reqBody.Email)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	if exists {
		return v1_common.Fail(c, http.StatusBadRequest, "Email has already been occupied.", nil)
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(reqBody.Password), bcrypt.DefaultCost)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	newUser, err := q.NewUser(ctx, db.NewUserParams{
		Email:       reqBody.Email,
		Password:    string(passwordHash),
		Permissions: int32(permissions.PermStartupOwner),
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "", err)
	}

	// send verification email using goroutine to not block
	// at this point, the user has successfully been created
	// so sending the verification email now is safe.
	go sendEmailVerification(newUser.ID, newUser.Email, h.server.GetQueries())

	// generate new access and refresh tokens
	accessToken, refreshToken, err := jwt.GenerateWithSalt(newUser.ID, newUser.TokenSalt)
	if err != nil {
		return v1_common.Fail(c, http.StatusCreated, "Registration complete but failed to sign in. Please sign in manually.", err)
	}

	// set the refresh token cookie
	setRefreshTokenCookie(c, refreshToken)

	logger.Info(fmt.Sprintf("New user created with email: %s", newUser.Email))

	return c.JSON(http.StatusCreated, AuthResponse{
		AccessToken: accessToken,
		User: UserResponse{
			ID:            newUser.ID,
			Email:         newUser.Email,
			EmailVerified: newUser.EmailVerified,
			Permissions:   uint32(newUser.Permissions),
		},
	})
}

/*
 * Handles user login flow:
 * 1. Validates email/password
 * 2. Generates access/refresh tokens
 * 3. Sets HTTP-only cookie with refresh token
 * 4. Returns access token and user info
 */
func (h *Handler) handleLogin(c echo.Context) error {
	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request format", err)
	}

	// validate request
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Validation failed", err)
	}

	queries := db.New(h.server.GetDB())
	user, err := queries.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	if !verifyPassword(req.Password, user.Password) {
		return v1_common.Fail(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.TokenSalt)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to generate tokens", err)
	}

	setRefreshTokenCookie(c, refreshToken)

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		User: UserResponse{
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			EmailVerified: user.EmailVerified,
			Permissions:   uint32(user.Permissions),
		},
	})
}

/*
This route is responsible in handling incoming requests to verify a user's email.
The link must have an email token as query parameter. The email token is a normal JWT as 'token'.
This email token is verified against our database.
*/
func (h *Handler) handleVerifyEmail(c echo.Context) error {
	logger := middleware.GetLogger(c)
	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	viewUrl := fmt.Sprintf("%s/auth", os.Getenv("FRONTEND_URL"))

	tokenStr := c.QueryParam("token")
	if tokenStr == "" {
		view := views.VerifyEmailPage(views.FailVerifyEmailPage, viewUrl, "Missing validation token.")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Failed to render verify email page", err)
		}
		return nil
	}

	claims, err := jwt.VerifyEmailToken(tokenStr)
	if err != nil {
		logger.Error(err, "Failed to verify email token")
		view := views.VerifyEmailPage(views.FailVerifyEmailPage, viewUrl, "The verification link is invalid or expired.")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Failed to render verify email page", err)
		}
		return nil
	}

	token, err := h.server.GetQueries().GetVerifyEmailTokenByID(ctx, claims.ID)
	if err != nil {
		logger.Error(err, "Failed to get email token from the database.")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusBadRequest, "Failed to verify email", err)
		}
		return nil
	}

	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		logger.Error(err, "Failed to start transaction")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}
	defer tx.Rollback(ctx)

	q := h.server.GetQueries().WithTx(tx)

	err = q.UpdateUserEmailVerifiedStatus(ctx, db.UpdateUserEmailVerifiedStatusParams{
		EmailVerified: true,
		ID:            token.UserID,
	})
	if err != nil {
		logger.Error(err, "Failed to update user verification status")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}

	user, err := q.GetUserByID(ctx, token.UserID)
	if err != nil {
		logger.Error(err, "Failed to get user data")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}

	err = q.RemoveVerifyEmailTokenByID(ctx, token.ID)
	if err != nil {
		logger.Error(err, "Failed to remove verification token")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}

	if err = tx.Commit(ctx); err != nil {
		logger.Error(err, "Failed to commit transaction")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.TokenSalt)
	if err != nil {
		logger.Error(err, "Failed to generate tokens")
		view := views.VerifyEmailPage(views.InternalErrorEmailPage, viewUrl, "")
		if err := view.Render(c.Request().Context(), c.Response()); err != nil {
			return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
		}
		return nil
	}

	setRefreshTokenCookie(c, refreshToken)

	redirectUrl := fmt.Sprintf("%s/auth?token=%s&email=%s&verified=true",
		os.Getenv("FRONTEND_URL"),
		url.QueryEscape(accessToken),
		url.QueryEscape(user.Email),
	)

	view := views.VerifyEmailPage(views.SuccessVerifyEmailPage, redirectUrl, "")
	if err := view.Render(c.Request().Context(), c.Response()); err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to verify email", err)
	}

	return nil
}

/*
Handle incoming requests to verify the refresh token saved in a HTTP-only cookie.
This route is used for a form to verify persistant authentication and generate
new access tokens for clients to use.

This route will also respond with the same type of body as register/login because
it is essentially a passwordless login for the user given that the refresh token
in the cookie is valid.
*/
func (h *Handler) handleVerifyCookie(c echo.Context) error {
	cookie, err := c.Cookie(COOKIE_REFRESH_TOKEN)
	if err != nil {
		return v1_common.Fail(c, http.StatusUnauthorized, "Missing refresh token cookie in request", err)
	}

	// verify the refresh token in the cookie
	refreshToken := cookie.Value
	claims, err := jwt.ParseUnverifiedClaims(refreshToken)
	if err != nil {
		unsetRefreshTokenCookie(c)
		return v1_common.Fail(c, http.StatusUnauthorized, "Cookie has invalid value.", err)
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// get salt
	user, err := h.server.GetQueries().GetUserByID(ctx, claims.UserID)
	if err != nil {
		unsetRefreshTokenCookie(c)
		return v1_common.Fail(c, http.StatusUnauthorized, "Cookie has invalid value.", err)
	}

	claims, err = jwt.VerifyTokenWithSalt(refreshToken, user.TokenSalt)
	if err != nil {
		unsetRefreshTokenCookie(c)
		return v1_common.Fail(c, http.StatusUnauthorized, "Cookie is not valid.", err)
	}

	accessToken, refreshToken, err := jwt.GenerateWithSalt(user.ID, user.TokenSalt)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Oops, something went wrong.", err)
	}

	if time.Until(claims.ExpiresAt.Time) < 3*24*time.Hour {
		// refresh token is about to expired in less than 3 days
		// set the new generated refresh token in the cookie
		setRefreshTokenCookie(c, refreshToken)
	}

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		User: UserResponse{
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			EmailVerified: user.EmailVerified,
			Permissions:   uint32(user.Permissions),
		},
	})
}

/*
Handle incoming logout requests. This will empty out the refresh token cookie.
*/
func (h *Handler) handleLogout(c echo.Context) error {
	unsetRefreshTokenCookie(c)
	return v1_common.Success(c, http.StatusOK, "Successfully logged out.")
}
