const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../../src/utils/jwt.util');

describe('jwt utils (unit)', () => {
  test('signToken -> verifyToken round-trips the payload', () => {
    const token = signToken({ sub: 42, role: 'ADMIN' });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(42);
    expect(decoded.role).toBe('ADMIN');
    expect(decoded.iss).toBe('task-tracker-api');
    expect(decoded.aud).toBe('task-tracker-client');
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test('verifyToken rejects a token signed with a different secret', () => {
    const forged = jwt.sign({ sub: 1, role: 'ADMIN' }, 'attacker-owned-secret', {
      issuer: 'task-tracker-api',
      audience: 'task-tracker-client',
    });

    expect(() => verifyToken(forged)).toThrow();
  });

  test('verifyToken rejects garbage and empty tokens', () => {
    expect(() => verifyToken('not.a.jwt')).toThrow();
    expect(() => verifyToken('')).toThrow();
  });
});