package tests

import (
	"KonferCA/SPUR/common"
	"os"
)

/*
Sets up all the any environment variables that the application needs to
properly boot up and run.
*/
func setupEnv() {
	os.Setenv("APP_ENV", common.TEST_ENV)
	// this is not a real bucket and is just here to allow
	// the stogare.NewStorage to proceed
	os.Setenv("AWS_S3_BUCKET", "test-bucket")
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres")
	os.Setenv("DB_NAME", "postgres")
	os.Setenv("DB_SSLMODE", "disable")
	os.Setenv("JWT_SECRET_VERIFY_EMAIL", "verify_email")
}
