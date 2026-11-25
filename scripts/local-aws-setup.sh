#!/usr/bin/env bash
set -euo pipefail

echo "Setting AWS environment variables for LocalStack / DynamoDB Local"

export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN:-test}
export AWS_DEFAULT_REGION=${AWS_REGION:-us-east-1}

S3_ENDPOINT=${AWS_S3_ENDPOINT:-http://localhost:4566}
DDB_ENDPOINT=${AWS_DYNAMODB_ENDPOINT:-http://localhost:8000}

BUCKET_NAME=${AWS_S3_BUCKET:-fragments}
TABLE_NAME=${AWS_DYNAMODB_TABLE:-fragments}

echo "Waiting for LocalStack S3..."
until aws --endpoint-url="$S3_ENDPOINT" s3 ls >/dev/null 2>&1; do
  sleep 2
  echo "  still waiting for S3..."
done
echo "LocalStack S3 Ready"

echo "Creating S3 bucket: $BUCKET_NAME (if not exists)"
aws --endpoint-url="$S3_ENDPOINT" s3 mb "s3://$BUCKET_NAME" 2>/dev/null || true

echo "Waiting for DynamoDB Local..."
until aws --endpoint-url="$DDB_ENDPOINT" dynamodb list-tables >/dev/null 2>&1; do
  sleep 2
  echo "  still waiting for DynamoDB..."
done
echo "DynamoDB Local Ready"

echo "Creating DynamoDB table: $TABLE_NAME (if not exists)"
aws --endpoint-url="$DDB_ENDPOINT" dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=ownerId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
  >/dev/null 2>&1 || true

echo "Local AWS setup done."
