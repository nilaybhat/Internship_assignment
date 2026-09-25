const jwt = require('jsonwebtoken');
const env = require('../config/env');

/** Sign a JWT for the given payload. */
function signToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'task-tracker-api',
    audience: 'task-tracker-client',
    ...options,
  });
}

/**
 * Verify a JWT. Returns the decoded payload or throws when
 * the token is invalid/expired/tampered with.
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'task-tracker-api',
    audience: 'task-tracker-client',
  });
}

module.exports = { signToken, verifyToken };