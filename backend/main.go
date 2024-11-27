package main

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/KonferCA/NoKap/common"
	"github.com/KonferCA/NoKap/internal/server"
	"github.com/joho/godotenv"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	if os.Getenv("APP_ENV") != common.PRODUCTION_ENV {
		if err := godotenv.Load(); err != nil {
			log.Fatal().Err(err).Msg("failed to load .env")
		}

		// setup pretty logging in development
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	}

	s, err := server.New(false)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialized server")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	err = s.Listen(":" + os.Getenv("PORT"))
	if err != nil {
		log.Fatal().Err(err).Str("PORT", port).Msg("failed to bind server to start accepting connections.")
	}
}
