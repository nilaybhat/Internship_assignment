const request = require('supertest');
const { hashPassword } = require('../../src/utils/password.util');
const prisma = require('../../src/database/prisma');

/**
 * Create a user directly in the database (password correctly hashed).
 * Returns the raw DB row, including the password hash.
 */
async function createDbUser({ name = 'Test User', email, password = 'password123', role = 'USER' }) {
  return prisma.user.create({
    data: { name, email, password: await hashPassword(password), role },
  });
}

/** Register a user over the real API endpoint (POST /api/auth/register). */
function registerViaApi(app, { name, email, password }) {
  return request(app)
    .post('/api/auth/register')
    .send({ name, email, password });
}

/** Log in over the real API endpoint and return the success body. */
async function loginViaApi(app, { email, password }) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
}

/** Convenience: register + login, returns { token, user }. */
async function registerAndLogin(app, overrides = {}) {
  const body = {
    name: 'Test User',
    email: `user-${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  };
  await registerViaApi(app, body).expect(201);
  const login = await loginViaApi(app, body);
  return { token: login.body.token, user: login.body.user };
}

/**
 * Authenticated supertest helper. Returns an object whose verb methods
 * (get/post/put/delete) attach the Bearer token to the request.
 */
function authed(app, token) {
  const chain = (verb, url) =>
    request(app)[verb](url).set('Authorization', `Bearer ${token}`);
  return {
    get: (url) => chain('get', url),
    post: (url) => chain('post', url),
    put: (url) => chain('put', url),
    delete: (url) => chain('delete', url),
  };
}

module.exports = {
  createDbUser,
  registerViaApi,
  loginViaApi,
  registerAndLogin,
  authed,
};