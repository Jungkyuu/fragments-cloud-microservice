// src/app.js
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const logger = require('./logger');

const app = express();

app.use(helmet());

// Parse text and JSON bodies as plain text so routes can handle them manually
app.use(
  express.text({
    type: ['text/*', 'application/json'],
    defaultCharset: 'utf-8',
  }),
);

// Parse URL-encoded form bodies (optional but useful)
app.use(express.urlencoded({ extended: false }));

app.use(
  morgan('combined', {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }),
);

// Mount API routes under /v1
app.use('/v1', routes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(err.status || 500).json({
    status: 'error',
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

module.exports = app;
