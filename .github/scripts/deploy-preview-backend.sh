#!/bin/bash

# immediately exit if any command returns a non-zero exit status.
set -e

#
# Preview Deployment Script
# Handles environment setup, database initialization, and application deployment
#

echo "Deploying new preview"

# Initialize configuration files
echo "Get .env from Konbini"
echo "$MICONFIG" > .miconfig.yaml
echo "$PK" > private.pem

# Environment setup
mi bento order

# Export all environment variables automatically
set -a
source .env
set +a

# PostgreSQL setup
echo "Setting up preview PostgreSQL container"
POSTGRES_DATA_DIR="$HOME/postgres"
mkdir -p $POSTGRES_DATA_DIR
POSTGRES_CONTAINER="$APP_NAME-postgres"

# Check and start PostgreSQL container if needed
if ! docker ps | grep $POSTGRES_CONTAINER; then
    echo "PostgreSQL container not found. Starting new container..."
    docker run -d \
        --name $POSTGRES_CONTAINER \
        -v $POSTGRES_DATA_DIR:/var/lib/postgresql/data \
        -p $DB_PORT:5432 \
        --env-file .env \
        postgres:16

    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    timeout 90s bash -c "until docker exec $POSTGRES_CONTAINER pg_isready ; do sleep 1 ; done" \
        && echo "Postgres is ready!"
else
    echo "PostgreSQL container is already running"
fi

# Database migrations
echo "Fix migrations from timestampd to sequential"
goose fix -dir .sqlc/migrations
echo "Run migrations"
goose -dir .sqlc/migrations postgres \
    "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE" up

# Application deployment
echo "Building application Docker image..."
docker build -t $APP_NAME:latest .

# Container management
echo "Stopping and removing existing container if present..."
docker stop $APP_NAME || true
docker rm $APP_NAME || true

echo "Starting new application container..."
docker run -d \
    --name $APP_NAME \
    --env-file .env \
    --network=host --add-host=host.docker.internal:host-gateway \
    -v ~/dist:/root/static/dist \
    $APP_NAME:latest

echo "Done: Preview Deployment"
