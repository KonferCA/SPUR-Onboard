# migration name
NAME ?= name
# default database configuration
TEST_DB_USER ?= postgres
TEST_DB_PASSWORD ?= postgres
TEST_DB_NAME ?= postgres
TEST_DB_HOST_PORT ?= 5432
TEST_DB_URL ?= postgres://$(TEST_DB_USER):$(TEST_DB_PASSWORD)@localhost:$(TEST_DB_HOST_PORT)/$(TEST_DB_NAME)?sslmode=disable
POSTGRESQL_VERSION ?= 16

.PHONY: query

dev:
	@VERSION=dev APP_ENV=development air
up:
	@goose -dir .sqlc/migrations postgres "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable" up
down:
	@goose -dir .sqlc/migrations postgres "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable" down-to 0
migration:
	@goose -dir .sqlc/migrations postgres "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable" create $(NAME) sql
sql:
	@sqlc generate

setup:
	@go install github.com/air-verse/air@v1.61.1 && \
		go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.27.0 && \
		go install github.com/pressly/goose/v3/cmd/goose@v3.22.1

init-dev-db:
	@docker run --name nokap-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DATABASE=postgres -p 5432:5432 -d postgres:$(POSTGRESQL_VERSION) && \
		timeout 90s bash -c "until docker exec nokap-postgres pg_isready ; do sleep 5 ; done" && echo "Postgres is ready! Run migrations with 'make up'"
start-dev-db:
	@docker start nokap-postgres && \
		timeout 90s bash -c \
		"until docker exec nokap-postgres pg_isready ; do sleep 5 ; done" && \
		echo "Postgres is ready! Run migrations with 'make up'"
stop-dev-db:
	@docker stop nokap-postgres
check-dev-db:
	@docker exec nokap-postgres pg_isready
clean-dev-db:
	@docker stop nokap-postgres && docker rm nokap-postgres
health-dev-db:
	@echo "Checking server health..."
	@curl -s localhost:8080/api/v1/health | jq || echo "Failed to connect to health endpoint"
query:
	@docker exec nokap-postgres psql -U postgres -d postgres -c "$(filter-out $@,$(MAKECMDGOALS))"
# Prevent make from treating the query string as a target
%:
	@:

test: start-testdb
	@trap 'make stop-testdb' EXIT; \
		if ! make run-tests; then \
			exit 1; \
		fi

start-testdb:
	@echo "Setting up PostgreSQL database..."
	@if ! docker ps -a --filter "name=test-postgres" --format '{{.Names}}' | grep -q '^test-postgres$$'; then \
		docker run --name test-postgres \
			-e POSTGRES_USER=$(TEST_DB_USER) \
			-e POSTGRES_PASSWORD=$(TEST_DB_PASSWORD) \
			-e POSTGRES_DB=$(TEST_DB_NAME) \
			-d -p "$(TEST_DB_HOST_PORT):5432" \
			postgres:$(POSTGRESQL_VERSION); \
	elif ! docker ps --filter "name=test-postgres" --format '{{.Names}}' | grep -q '^test-postgres$$'; then \
		docker start test-postgres; \
	fi
	@echo "Waiting for PostgreSQL to be ready..."
	@timeout 30s bash -c 'until docker exec test-postgres pg_isready -U $(TEST_DB_USER); do sleep 1; done'
	@echo "Running migrations..."
	@goose -dir .sqlc/migrations postgres "$(TEST_DB_URL)" up

run-tests:
	@go test -v ./...

stop-testdb:
	@echo "Stopping test db..."
	@docker container stop test-postgres || true
	@echo "Removing test db..."
	@docker container rm -f test-postgres || true

# helper target to check database connection
check-testdb:
	@echo "Testing database connection..."
	@docker exec test-postgres psql -U $(TEST_DB_USER) -d $(TEST_DB_NAME) -c "SELECT 1"
