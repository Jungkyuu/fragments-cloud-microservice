// src/model/data/index.js
const logger = require('../../logger');

let FragmentModel;

switch ((process.env.DATA_LAYER || 'memory').toLowerCase()) {
  case 'aws':
    logger.info('Using AWS data layer (DynamoDB + S3)');
    FragmentModel = require('./aws');
    break;
  case 'memory':
  default:
    logger.info('Using in-memory data layer');
    FragmentModel = require('./memory');
    break;
}

module.exports = FragmentModel;
