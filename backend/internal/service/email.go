package service

import (
	"os"

	"github.com/resend/resend-go/v2"
	"github.com/rs/zerolog/log"
)

/*
SendEmail tries to send an email from the given email address to all the recipients' addresses.
The body should be an html body that has already been formatted using a templating system.
It is important to call this function in a go routine to no block.
*/
func SendEmail(subject string, from string, to []string, html string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      to,
		Subject: subject,
		Html:    html,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		return err
	}

	log.Info().Str("email_id", sent.Id).Str("from", from).Strs("to", to).Str("subject", subject).Msg("Email sent!")

	return nil
}
