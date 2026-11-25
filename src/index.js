// src/index.js
require('dotenv').config();
const app = require('./app');
const logger = require('./logger');

const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info(`Fragments server listening on port ${port}`);
});
