const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase } = require('../helpers/db');
const {
  createDbUser,
  registerViaApi,
  loginViaApi,
  authed,
} = require('../helpers/test-data');

beforeEach(resetDatabase);

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    test('registers a new user (201) and never exposes the password', async () => {
      const res = await registerViaApi(app, {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
      });
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('id');
      // The API response must never echo the password back to the client.
      expect(JSON.stringify(res.body)).not.toContain('secret123');
    });

    test('rejects a duplicate email with 409', async () => {
      await registerViaApi(app, { name: 'Alice', email: 'dup@example.com', password: 'secret123' }).expect(
        201
      );

      const res = await registerViaApi(app, {
        name: 'Bob',
        email: 'dup@example.com',
        password: 'secret123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('rejects invalid payloads with 400 and field-level details', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'not-an-email', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThanOrEqual(1);
    });

    test('stores the password as a bcrypt hash, never plain text', async () => {
      await registerViaApi(app, {
        name: 'Nilay',
        email: 'hashcheck@example.com',
        password: 'plainsecret',
      }).expect(201);

      // Verify against the actual database row (deleted in beforeEach reset).
      const prisma = require('../../src/database/prisma');
      const dbUser = await prisma.user.findUnique({ where: { email: 'hashcheck@example.com' } });

      expect(dbUser.password).toMatch(/^\$2[aby]\$/);
      expect(dbUser.password).not.toBe('plainsecret');
    });
  });

  describe('POST /api/auth/login', () => {
    test('returns a JWT and safe user on valid credentials', async () => {
      await registerViaApi(app, {
        name: 'Nilay',
        email: 'nilay@example.com',
        password: 'secret123',
      }).expect(201);

      const res = await loginViaApi(app, {
        email: 'nilay@example.com',
        password: 'secret123',
      });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.split('.')).toHaveLength(3);
      expect(res.body.user).toMatchObject({
        email: 'nilay@example.com',
        role: 'USER',
      });
      expect(res.body.user).not.toHaveProperty('password');
    });

    test('rejects a wrong password with 401', async () => {
      await createDbUser({ email: 'locked@example.com', password: 'correctpass' });
      const res = await loginViaApi(app, {
        email: 'locked@example.com',
        password: 'wrongpass',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test('rejects an unknown email with 401 (no user enumeration)', async () => {
      await createDbUser({ email: 'known@example.com', password: 'correctpass' });

      const [knownRes, ghostRes] = await Promise.all([
        loginViaApi(app, { email: 'known@example.com', password: 'wrongpass' }),
        loginViaApi(app, { email: 'ghost@example.com', password: 'whatever' }),
      ]);

      expect(knownRes.status).toBe(401);
      expect(ghostRes.status).toBe(401);
      // Identical generic message: the API does not reveal which field was wrong
      // nor whether the account exists.
      expect(ghostRes.body.message).toBe(knownRes.body.message);
    });

    test('rejects missing fields with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'nilay@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/me', () => {
    test('returns 401 without a token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    test('returns 401 for a garbage token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer not-a-valid-token');
      expect(res.status).toBe(401);
    });

    test('returns the authenticated profile', async () => {
      const user = await createDbUser({ email: 'me@example.com' });
      const login = await loginViaApi(app, { email: 'me@example.com', password: 'password123' });

      const res = await authed(app, login.body.token).get('/api/users/me');

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: user.id, email: 'me@example.com' });
      expect(res.body.data).not.toHaveProperty('password');
    });
  });

  describe('role-based access control', () => {
    test('a normal user gets 403 on admin-only GET /api/users', async () => {
      const { token } = await registerAndLoginHelper(app);
      const res = await authed(app, token).get('/api/users');
      expect(res.status).toBe(403);
    });

    test('an admin can list all users', async () => {
      await createDbUser({ email: 'u1@example.com', role: 'USER' });
      await createDbUser({ email: 'admin@example.com', role: 'ADMIN' });

      const admin = await loginViaApi(app, {
        email: 'admin@example.com',
        password: 'password123',
      });

      const res = await authed(app, admin.body.token).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).not.toHaveProperty('password');
    });
  });
});

/** Register + login one user and return their token. */
async function registerAndLoginHelper(appInstance) {
  const email = `helper-${Date.now()}@example.com`;
  await registerViaApi(appInstance, { name: 'Helper', email, password: 'password123' });
  const login = await loginViaApi(appInstance, { email, password: 'password123' });
  return { token: login.body.token };
}