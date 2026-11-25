// src/aws/clients.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../logger');

const region = process.env.AWS_REGION || 'us-east-1';
const dynamoEndpoint = process.env.AWS_DYNAMODB_ENDPOINT;
const s3Endpoint = process.env.AWS_S3_ENDPOINT;

const isLocal = Boolean(dynamoEndpoint || s3Endpoint);

const baseConfig = {
  region,
};

if (isLocal) {
  baseConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    sessionToken: process.env.AWS_SESSION_TOKEN || 'test',
  };
}

const dynamoConfig = {
  ...baseConfig,
  ...(dynamoEndpoint ? { endpoint: dynamoEndpoint } : {}),
};

const s3Config = {
  ...baseConfig,
  ...(s3Endpoint ? { endpoint: s3Endpoint, forcePathStyle: true } : {}),
};

logger.info({ dynamoEndpoint, s3Endpoint }, 'AWS clients configuration');

const dynamoClient = new DynamoDBClient(dynamoConfig);
const s3Client = new S3Client(s3Config);

module.exports = {
  dynamoClient,
  s3Client,
};
