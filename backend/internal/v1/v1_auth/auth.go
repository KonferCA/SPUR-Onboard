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
	"strings"
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

	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to begin transaction", err)
	}
	defer tx.Rollback(context.Background())

	q := h.server.GetQueries().WithTx(tx)

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

	// create a company upon registration
	company, err := q.CreateCompany(ctx, db.CreateCompanyParams{
		OwnerID:       newUser.ID,
		Name:          "Untitled",
		WalletAddress: nil,
		LinkedinUrl:   "",
		Description:   nil,
		DateFounded:   time.Now().Unix(),
		Website:       nil,
		Stages:        []string{},
	})
	if err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to create group for new user.", err)
	}

	// Commit changes
	if err := tx.Commit(ctx); err != nil {
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to commit changes for new user and group", err)
	}

	// generate new access and refresh tokens
	accessToken, refreshToken, err := jwt.GenerateWithSalt(newUser.ID, newUser.TokenSalt)
	if err != nil {
		return v1_common.Fail(c, http.StatusCreated, "Registration complete but failed to sign in. Please sign in manually.", err)
	}

	// set the refresh token cookie
	setRefreshTokenCookie(c, refreshToken)

	logger.Info(fmt.Sprintf("New user created with email: %s", newUser.Email))

	// send verification email using goroutine to not block
	// at this point, the user has successfully been created
	// so sending the verification email now is safe.
	go sendEmailVerification(newUser.ID, newUser.Email, h.server.GetQueries())

	return c.JSON(http.StatusCreated, AuthResponse{
		AccessToken: accessToken,
		CompanyId:   &company.ID,
		User: UserResponse{
			ID:                newUser.ID,
			Email:             newUser.Email,
			EmailVerified:     newUser.EmailVerified,
			Permissions:       uint32(newUser.Permissions),
			ProfilePictureUrl: newUser.ProfilePictureUrl,
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
	logger := middleware.GetLogger(c)

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

	var companyId *string = nil
	company, err := queries.GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err != nil {
		// just log the reason why it failed to fetch company id on login
		logger.Warn(fmt.Sprintf("Error getting company on login: %s", err.Error()))
	} else {
		// do not return bad request on error because user might not have created a company yet
		// in case the error is
		companyId = &company.ID
	}

	setRefreshTokenCookie(c, refreshToken)

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		CompanyId:   companyId,
		User: UserResponse{
			ID:                user.ID,
			FirstName:         user.FirstName,
			LastName:          user.LastName,
			Email:             user.Email,
			EmailVerified:     user.EmailVerified,
			Permissions:       uint32(user.Permissions),
			ProfilePictureUrl: user.ProfilePictureUrl,
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
Handles resending verification emails for users who haven't verified their email yet
or if the link has expired
*/
func (h *Handler) handleResendVerificationEmail(c echo.Context) error {
	logger := middleware.GetLogger(c)

	user, ok := c.Get("user").(*db.User)
	if !ok {
		return v1_common.Fail(c, http.StatusInternalServerError, "", errors.New("failed to cast user type from context"))
	}

	// prevent sending verification email if already verified
	if user.EmailVerified {
		return v1_common.Fail(c, http.StatusBadRequest, "email is already verified", nil)
	}

	logger.Info(fmt.Sprintf("Resending verification email to user: %s", user.Email))

	// use the existing helper function to send the verification email
	go sendEmailVerification(user.ID, user.Email, h.server.GetQueries())

	return v1_common.Success(c, http.StatusOK, "verification email sent")
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
	logger := middleware.GetLogger(c)

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

	var companyId *string = nil
	company, err := h.server.GetQueries().GetCompanyByOwnerID(c.Request().Context(), user.ID)
	if err != nil {
		// just log the reason why it failed to fetch company id on login
		logger.Warn(fmt.Sprintf("Error getting company on login: %s", err.Error()))
	} else {
		// do not return bad request on error because user might not have created a company yet
		// in case the error is
		companyId = &company.ID
	}

	return c.JSON(http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		CompanyId:   companyId,
		User: UserResponse{
			ID:                user.ID,
			FirstName:         user.FirstName,
			LastName:          user.LastName,
			Email:             user.Email,
			EmailVerified:     user.EmailVerified,
			Permissions:       uint32(user.Permissions),
			ProfilePictureUrl: user.ProfilePictureUrl,
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

/*
helper function that sends a password reset email.
keep in mind that we don't reveal if the email exists or not for security reasons.
*/
func sendPasswordResetEmail(email string, queries *db.Queries) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	// find user by email
	user, err := queries.GetUserByEmail(ctx, email)
	if err != nil {
		// if user doesn't exist, just return without error to prevent email enumeration
		log.Info().Str("email", email).Msg("Password reset requested for non-existent email.")
		return
	}

	// check if a token already exists
	exists, err := queries.ExistsPasswordResetTokenByUserID(ctx, user.ID)
	if err != nil {
		log.Error().Err(err).Str("user_id", user.ID).Str("email", email).Msg("Failed to check existing password reset token.")
		return
	}

	if exists {
		// remove existing token
		err := queries.RemovePasswordResetTokenByUserID(ctx, user.ID)
		if err != nil {
			log.Error().Err(err).Str("user_id", user.ID).Str("email", email).Msg("Failed to remove existing password reset token.")
			return
		}
	}

	// create a new token valid for 1 hour
	exp := time.Now().Add(time.Hour).UTC()
	tokenID, err := queries.NewPasswordResetToken(ctx, db.NewPasswordResetTokenParams{
		UserID:    user.ID,
		ExpiresAt: exp.Unix(),
	})
	if err != nil {
		log.Error().Err(err).Str("user_id", user.ID).Str("email", email).Msg("Failed to create password reset token.")
		return
	}

	// generate jwt for password reset
	resetToken, err := jwt.GenerateResetPasswordToken(email, tokenID, exp)
	if err != nil {
		log.Error().Err(err).Str("user_id", user.ID).Str("email", email).Msg("Failed to generate password reset token.")
		return
	}

	// send email
	err = service.SendPasswordResetEmail(ctx, email, resetToken)
	if err != nil {
		log.Error().Err(err).Str("user_id", user.ID).Str("email", email).Msg("Failed to send password reset email.")
		return
	}

	log.Info().Str("user_id", user.ID).Str("email", email).Msg("Password reset email sent.")
}

/*
this handler is responsible for initiating the password reset flow.
it accepts an email address and sends a password reset link if the user exists.
for security reasons, it always returns a success response regardless of whether
the email exists or not to prevent email enumeration attacks.
*/
func (h *Handler) handleForgotPassword(c echo.Context) error {
	var req ForgotPasswordRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// send password reset email in a goroutine to avoid blocking
	go sendPasswordResetEmail(req.Email, h.server.GetQueries())

	// always return success even if the email doesn't exist
	// this prevents email enumeration attacks
	return v1_common.Success(c, http.StatusOK, "If the email exists in our system, a password reset link will be sent.")
}

/*
this handler is responsible for handling the actual password reset.
it verifies the token and changes the user's password if the token is valid.
*/
func (h *Handler) handleResetPassword(c echo.Context) error {
	logger := middleware.GetLogger(c)

	var req ResetPasswordRequest
	if err := c.Bind(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}
	if err := c.Validate(&req); err != nil {
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid request body", err)
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), time.Minute)
	defer cancel()

	// verify the token
	claims, err := jwt.VerifyResetPasswordToken(req.Token)
	if err != nil {
		logger.Error(err, "Failed to verify password reset token")
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid or expired token", nil)
	}

	// get the token from the database
	token, err := h.server.GetQueries().GetPasswordResetTokenByID(ctx, claims.ID)
	if err != nil {
		logger.Error(err, "Failed to get password reset token from database")
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid or expired token", nil)
	}

	// start a transaction
	tx, err := h.server.GetDB().Begin(ctx)
	if err != nil {
		logger.Error(err, "Failed to start transaction")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}
	defer tx.Rollback(ctx)

	q := h.server.GetQueries().WithTx(tx)

	// get the user
	user, err := q.GetUserByID(ctx, token.UserID)
	if err != nil {
		logger.Error(err, "Failed to get user data")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}

	// check if the email matches
	if strings.ToLower(user.Email) != strings.ToLower(claims.Email) {
		logger.Error(err, "Email mismatch in password reset token")
		return v1_common.Fail(c, http.StatusBadRequest, "Invalid token", nil)
	}

	// hash the new password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error(err, "Failed to hash password")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}

	// update the user's password and create a new token salt
	err = q.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		Password: string(passwordHash),
		ID:       user.ID,
	})
	if err != nil {
		logger.Error(err, "Failed to update user password")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}

	// remove the token
	err = q.RemovePasswordResetTokenByID(ctx, token.ID)
	if err != nil {
		logger.Error(err, "Failed to remove password reset token")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}

	// commit the transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Error(err, "Failed to commit transaction")
		return v1_common.Fail(c, http.StatusInternalServerError, "Failed to reset password", err)
	}

	logger.Info(fmt.Sprintf("Password reset successful for user: %s", user.Email))

	return v1_common.Success(c, http.StatusOK, "Password reset successful")
}
