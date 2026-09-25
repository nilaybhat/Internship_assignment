const { requireRole } = require('../../src/middleware/role.middleware');

function mockRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('role middleware (unit)', () => {
  test('allows a request when the user role is permitted', () => {
    const next = jest.fn();
    const req = { user: { id: 1, role: 'ADMIN' } };

    requireRole('ADMIN')(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects a non-admin user with 403 Forbidden', () => {
    const next = jest.fn();
    const res = mockRes();
    const req = { user: { id: 2, role: 'USER' } };

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const [err] = next.mock.calls[0];
    expect(err.statusCode).toBe(403);
  });

  test('rejects a request with no authenticated user with 401', () => {
    const next = jest.fn();
    const res = mockRes();
    const req = {};

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const [err] = next.mock.calls[0];
    expect(err.statusCode).toBe(401);
  });
});