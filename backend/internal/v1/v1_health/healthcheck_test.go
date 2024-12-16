package v1health

import (
	"KonferCA/SPUR/common"
	"KonferCA/SPUR/db"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetSystemInfo(t *testing.T) {
	// this variable is set using build flags, but in test environment, that is not available
	common.VERSION = "test"

	info := getSystemInfo()

	assert.NotEmpty(t, info.Version)
	assert.NotEmpty(t, info.GoVersion)
	assert.Greater(t, info.NumGoRoutine, 0)
	assert.GreaterOrEqual(t, info.MemoryUsage, 0.0)
}

func TestCheckDatabase(t *testing.T) {
	pool, err := db.NewPool(
		fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			"localhost",
			"5432",
			"postgres",
			"postgres",
			"postgres",
			"disable",
		),
	)
	assert.Nil(t, err)

	info := checkDatabase(db.New(pool))
	assert.True(t, info.Connected)
	// latency must be higher than 0 if connection is actually proper
	assert.Greater(t, info.LatencyMs, 0.0)
	assert.Contains(t, info.PostgresVersion, "PostgreSQL 16")
	assert.Empty(t, info.Error)
}
