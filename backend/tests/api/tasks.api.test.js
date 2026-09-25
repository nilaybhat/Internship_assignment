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

async function createTaskAs(token, payload) {
  return authed(app, token).post('/api/tasks').send(payload);
}

describe('Task API', () => {
  describe('POST /api/tasks', () => {
    test('requires authentication (401 without a token)', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Hack' });
      expect(res.status).toBe(401);
    });

    test('creates a task for the authenticated user (201)', async () => {
      const { token } = await registerAndLogin();
      const res = await createTaskAs(token, {
        title: 'Complete assignment',
        description: 'Finish backend and frontend',
        status: 'pending',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Complete assignment',
        description: 'Finish backend and frontend',
        status: 'pending',
      });
      expect(res.body.data).toHaveProperty('id');
    });

    test('rejects a task without a title (400) with field details', async () => {
      const { token } = await registerAndLogin();
      const res = await createTaskAs(token, { description: 'no title here' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.some((d) => d.field === 'title')).toBe(true);
    });

    test('rejects an invalid status value (400)', async () => {
      const { token } = await registerAndLogin();
      const res = await createTaskAs(token, { title: 'X', status: 'in_progress' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    test('normal user sees ONLY their own tasks', async () => {
      const alice = await registerAndLogin();
      const bob = await registerAndLogin();

      await createTaskAs(alice.token, { title: 'Alice private task' });
      await createTaskAs(bob.token, { title: 'Bob private task' });

      const res = await authed(app, alice.token).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Alice private task');
      expect(res.body.data[0].userId).toBe(alice.user.id);
    });

    test('filters by status when ?status= is provided', async () => {
      const { token } = await registerAndLogin();
      await createTaskAs(token, { title: 'Pending one' });
      await createTaskAs(token, { title: 'Done one', status: 'completed' });

      const pending = await authed(app, token).get('/api/tasks?status=pending');
      const completed = await authed(app, token).get('/api/tasks?status=completed');

      expect(pending.body.data).toHaveLength(1);
      expect(pending.body.data[0].title).toBe('Pending one');
      expect(completed.body.data).toHaveLength(1);
      expect(completed.body.data[0].title).toBe('Done one');
    });

    test('returns an empty array when the user has no tasks', async () => {
      const { token } = await registerAndLogin();
      const res = await authed(app, token).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('ownership & authorization', () => {
    test("user A cannot update user B's task (403)", async () => {
      const alice = await registerAndLogin();
      const bob = await registerAndLogin();

      const bobTask = await createTaskAs(bob.token, { title: "Bob's task" });

      const res = await authed(app, alice.token)
        .put(`/api/tasks/${bobTask.body.data.id}`)
        .send({ title: 'Hijacked' });

      expect(res.status).toBe(403);
    });

    test("user A cannot delete user B's task (403)", async () => {
      const alice = await registerAndLogin();
      const bob = await registerAndLogin();

      const bobTask = await createTaskAs(bob.token, { title: "Bob's task" });

      const res = await authed(app, alice.token).delete(`/api/tasks/${bobTask.body.data.id}`);
      expect(res.status).toBe(403);
    });

    test('returns 404 when updating a task that does not exist', async () => {
      const { token } = await registerAndLogin();
      const res = await authed(app, token)
        .put('/api/tasks/999999')
        .send({ title: 'Ghost' });
      expect(res.status).toBe(404);
    });

    test('returns 400 for a non-numeric task id', async () => {
      const { token } = await registerAndLogin();
      const res = await authed(app, token).put('/api/tasks/abc').send({ title: 'X' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('owner can update title, description and status', async () => {
      const { token } = await registerAndLogin();
      const created = await createTaskAs(token, { title: 'Original', status: 'pending' });

      const res = await authed(app, token)
        .put(`/api/tasks/${created.body.data.id}`)
        .send({ title: 'Updated title', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        title: 'Updated title',
        status: 'completed',
      });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('owner can delete their own task', async () => {
      const { token } = await registerAndLogin();
      const created = await createTaskAs(token, { title: 'Delete me' });

      const res = await authed(app, token).delete(`/api/tasks/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);

      const list = await authed(app, token).get('/api/tasks');
      expect(list.body.data).toEqual([]);
    });
  });

  describe('admin access', () => {
    test('admin sees ALL tasks across users', async () => {
      const alice = await registerAndLogin();
      const bob = await registerAndLogin();
      await createTaskAs(alice.token, { title: 'Alice task' });
      await createTaskAs(bob.token, { title: 'Bob task' });

      await createDbUser({ email: 'root@example.com', role: 'ADMIN' });
      const admin = await loginViaApi(app, {
        email: 'root@example.com',
        password: 'password123',
      });

      const res = await authed(app, admin.body.token).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      // Admin responses include the owner info.
      expect(res.body.data[0]).toHaveProperty('user');
    });

    test('admin can edit any users task', async () => {
      const bob = await registerAndLogin();
      const bobTask = await createTaskAs(bob.token, { title: "Bob's task" });

      await createDbUser({ email: 'root@example.com', role: 'ADMIN' });
      const admin = await loginViaApi(app, {
        email: 'root@example.com',
        password: 'password123',
      });

      const res = await authed(app, admin.body.token)
        .put(`/api/tasks/${bobTask.body.data.id}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });
});

/** Register + login a fresh user, returns { token, user }. */
async function registerAndLogin() {
  const body = {
    name: 'Test User',
    email: `user-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
    password: 'password123',
  };
  await registerViaApi(app, body).expect(201);
  const login = await loginViaApi(app, body);
  return { token: login.body.token, user: login.body.user };
}