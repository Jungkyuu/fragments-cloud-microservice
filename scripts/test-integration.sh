#!/usr/bin/env bash
set -euo pipefail

echo "=== Running integration tests with docker-compose + LocalStack + DynamoDB Local ==="

# 1. Start docker-compose stack (fragments + dynamodb-local + localstack)
echo "-> Starting docker-compose stack..."
docker compose up -d

# 2. Wait for Local AWS emulators and create S3 bucket + DynamoDB table
echo "-> Running local AWS setup (S3 bucket + DynamoDB table)..."
AWS_S3_ENDPOINT=${AWS_S3_ENDPOINT:-http://localhost:4566} \
AWS_DYNAMODB_ENDPOINT=${AWS_DYNAMODB_ENDPOINT:-http://localhost:8000} \
./scripts/local-aws-setup.sh

# 3. Run Hurl tests against dockerized fragments service on localhost:8080
echo "-> Running Hurl integration tests..."
hurl --test --jobs 1 \
  --user user1:password \
  --variable base_url=http://localhost:8080 \
  tests/integration/fragments.hurl

echo "=== Integration tests completed successfully ==="
