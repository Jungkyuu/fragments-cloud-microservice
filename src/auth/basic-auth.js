// src/auth/basic-auth.js
//
// Very simple HTTP Basic Auth middleware.
//
// For this assignment we only need one static user:
//   username: testuser
//   password: 1234
//
// In production you would not hard-code credentials like this, but
// for a course project and demo environment this is acceptable.

const logger = require('../logger');

// Parse the Authorization header and return { username, password } or null.
function parseBasicAuth(header) {
  if (!header || !header.startsWith('Basic ')) {
    return null;
  }

  // "Basic base64(username:password)"
  const base64Credentials = header.slice('Basic '.length).trim();
  let decoded;
  try {
    decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  } catch (err) {
    // Invalid base64
    return null;
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex < 0) {
    // No ":" in the decoded string → invalid format
    return null;
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return { username, password };
}

// Single valid user for this service.
// You can override via env vars if you want, but defaults are fine.
const VALID_USER = process.env.BASIC_USER || 'testuser';
const VALID_PASSWORD = process.env.BASIC_PASSWORD || '1234';

function basicAuth(req, res, next) {
  const credentials = parseBasicAuth(req.headers.authorization);

  // Reject if missing or wrong username/password.
  if (
    !credentials ||
    credentials.username !== VALID_USER ||
    credentials.password !== VALID_PASSWORD
  ) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Fragments"');
    return res.status(401).json({
      status: 'error',
      error: { message: 'unauthorized', code: 401 },
    });
  }

  // Attach authenticated user info to the request.
  req.user = { id: credentials.username };

  logger.debug({ user: req.user.id }, 'Authenticated user');
  return next();
}

module.exports = basicAuth;
