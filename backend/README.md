# Welcome to Konfer's :unicorn: Project SPUR

## Getting Started

### Install Golang

Follow the instructions from https://go.dev/doc/install
Make sure to download **VERSION 1.23** for best compatibility.

### Install Pre-requisite tools

- Air (auto-reload backend): go install github.com/air-verse/air@latest
- SQLc (generate type-safe code from SQL queries): go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
- Goose (SQL migration management tool): go install github.com/pressly/goose/v3/cmd/goose@latest
- Make
- Docker

> Make commands only work on unix like systems.

### Setup Development Environment

1. Create a new PostgreSQL instance using docker with `make init-dev-db`
2. Start PostgreSQL for development `make start-dev-db`
   - Check health of DB `make health-dev-db`
4. Run migrations when ready `make up`
5. Start development server `make dev`

> Use `make query "SELECT ... FROM ..."` for quick query on the terminal.
> You should also checkout the other available commands in the Makefile.
