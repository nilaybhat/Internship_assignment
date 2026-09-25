const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../config/env');

/** Hash a plain-text password using bcrypt (never stored in plain text). */
async function hashPassword(plainText) {
  return bcrypt.hash(plainText, BCRYPT_ROUNDS);
}

/** Compare a plain-text password against a stored bcrypt hash. */
async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

module.exports = { hashPassword, verifyPassword };