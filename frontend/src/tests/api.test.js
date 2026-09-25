import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api, { authApi, taskApi, userApi } from '../services/api';

/**
 * API integration tests: exercise the real axios instance + interceptors
 * against a mocked HTTP transport (axios-mock-adapter). This verifies the
 * JWT is attached to protected calls and that endpoint paths/params match
 * the documented API contract.
 */
describe('API service (integration)', () => {
  let mock;

  beforeEach(() => {
    localStorage.clear();
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it('authApi.login POSTs to /auth/login and returns the token + user', async () => {
    mock.onPost('/auth/login').reply(200, {
      success: true,
      token: 'jwt-token',
      user: { email: 'nilay@example.com', role: 'USER' },
    });

    const res = await authApi.login({ email: 'nilay@example.com', password: 'password123' });

    expect(res.data.token).toBe('jwt-token');
    expect(res.data.user.email).toBe('nilay@example.com');
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe('/auth/login');
  });

  it('attaches the stored JWT (Bearer) to protected API calls', async () => {
    localStorage.setItem('task_tracker_token', 'stored-jwt-token');
    mock.onGet('/tasks').reply(200, { success: true, data: [] });
    mock.onGet('/users').reply(200, { success: true, data: [] });

    await taskApi.list();
    await userApi.list();

    expect(mock.history.get.map((r) => r.url)).toEqual(['/tasks', '/users']);
    for (const req of mock.history.get) {
      const auth = req.headers?.Authorization ?? req.headers?.get?.('Authorization');
      expect(auth).toBe('Bearer stored-jwt-token');
    }
  });

  it('taskApi.list forwards the status query parameter for filtering', async () => {
    mock.onGet('/tasks').reply(200, { success: true, data: [] });

    await taskApi.list({ status: 'completed' });

    expect(mock.history.get[0].params).toEqual({ status: 'completed' });
  });
});