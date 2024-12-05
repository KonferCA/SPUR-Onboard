package service

import (
	"KonferCA/SPUR/common"
	"KonferCA/SPUR/internal/views"
	"bytes"
	"context"
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
	"github.com/rs/zerolog/log"
)

/*
SendVerficationEmail takes a JWT that is later verified by the verify email route.
The function requires the BACKEND_URL env to work.
It is important to call this function in a go routine to no block.
*/
func SendVerficationEmail(ctx context.Context, to string, token string) error {
	url := fmt.Sprintf("%s/api/v1/auth/verify-email?token=%s", os.Getenv("BACKEND_URL"), token)
	buf := bytes.Buffer{}
	err := views.VerificationEmail(url).Render(ctx, &buf)
	if err != nil {
		return err
	}

	return SendEmail(ctx, "Verify Your Email", os.Getenv("NOREPLY_EMAIL"), []string{to}, buf.String())
}

/*
SendEmail tries to send an email from the given email address to all the recipients' addresses.
The body should be an html body that has already been formatted using a templating system.
It is important to call this function in a go routine to no block.
*/
func SendEmail(ctx context.Context, subject string, from string, to []string, html string) error {
	if os.Getenv("APP_ENV") == common.TEST_ENV {
		return nil
	}

	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      to,
		Subject: subject,
		Html:    html,
	}

	sent, err := client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return err
	}

	log.Info().Str("email_id", sent.Id).Str("from", from).Strs("to", to).Str("subject", subject).Msg("Email sent!")

	return nil
}
