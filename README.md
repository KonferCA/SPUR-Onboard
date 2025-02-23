<h1 align="center">
  <a href="https://onboard.spuric.com/">
      <picture>
          <source height="175" media="(prefers-color-scheme: dark)" srcset="https://github.com/KonferCA/Konfer/blob/main/src/assets/partners/spur-brand.svg">
          <img height="175" alt="SPUR" src="https://github.com/KonferCA/Konfer/blob/main/src/assets/partners/spur-brand.svg">
      </picture>
  </a>
  <br>
  
  ![Website](https://img.shields.io/website?url=https%3A%2F%2Fonboard.spuric.com%2F&style=flat-square) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/KonferCA/SPUR?filename=%2Fbackend%2Fgo.mod&style=flat-square) ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/KonferCA/SPUR?style=flat-square) ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues-pr/KonferCA/SPUR?style=flat-square)
</h1>
<p align="center">
  <em> <b>SPUR</b> needs a streamlined digital platform to manage startup on-boarding, review, and funding processes. The current system relies on fragmented communication channels, creating inefficiencies for both SPUR administrators and startup applicants. </em>
</p>

---

## 🔨 Builds & Deployments

[![Deploy Backend to AWS - Preview](https://github.com/KonferCA/SPUR/actions/workflows/deploy-aws-preview-backend.yml/badge.svg?branch=main)](https://github.com/KonferCA/SPUR/actions/workflows/deploy-aws-preview-backend.yml)
[![Deploy Frontend to AWS - Preview](https://github.com/KonferCA/SPUR/actions/workflows/deploy-aws-preview-frontend.yml/badge.svg?branch=main)](https://github.com/KonferCA/SPUR/actions/workflows/deploy-aws-preview-frontend.yml)

## ⚡ Quickstart
>[!NOTE]
> This is the monorepo containing the backend and frontend code for the webapp, as well as code related to the Web3 infrastructure

> Clone the repo
```console
git clone https://github.com/KonferCA/SPUR.git
```

> From your terminal, navigate to the root path of your clone
```console
cd path/to/your/clone
```

## ⚙️ Installation [Backend]

SPUR backend requires **Go version `1.23` or higher** for best compatibility. If you need to install or upgrade Go, visit the [official Go download page](https://go.dev/dl/).

### Getting Started

> From your terminal, navigate to the backend path of your clone
```console
cd path/to/your/clone/backend
```

#### 🔨 Install prerequisite tools

> Air (auto-reload backend)

```console
go install github.com/air-verse/air@v1.61.1
```

> SQLc (generate type-safe code from SQL queries)
```console
go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.27.0
```

> Goose (SQL migration management tool)
```console
go install github.com/pressly/goose/v3/cmd/goose@v3.22.1
```

#### 🍺 Homebrew quick start
> Make
```console
brew install make
```

> Docker
```console
brew install docker
```

> [!IMPORTANT]
>  Make commands only work on unix like systems.

#### 🏗️ Setup development environment

> Create a new PostgreSQL instance using Docker
```console
make init-dev-db
```

> Start PostgreSQL for development
```console
make start-dev-db
```
> Check health of DB
```console
make health-dev-db
```

> Run migrations when ready
```console
make up
```

> Start development server
```console
make dev
```

> [!NOTE]
> Use `make query "SELECT ... FROM ..."` for quick query on the terminal.
> You should also checkout the other available commands in the Makefile.

--- 

## ⚙️ Installation [Frontend]

SPUR frontend requires **Node version `22.9.0` or higher** for best compatibility. If you need to install or upgrade Node, visit the [official Node download page](https://nodejs.org/en/download/).

### Getting Started

> From your terminal, navigate to the backend path of your clone
```console
cd path/to/your/clone/frontend
```

#### 🔨 Install prerequisite tools

> Install pnpm using npm
```console
npm install -g pnpm
```

#### 🏗️ Setup development environment

> Install dependencies
```console
pnpm i
```

> Run local server
```console
pnpm dev
```
