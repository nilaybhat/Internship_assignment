const { registerSchema, loginSchema } = require('../../src/validators/auth.validator');
const { taskCreateSchema, taskUpdateSchema } = require('../../src/validators/task.validator');

describe('auth validators (unit)', () => {
  test('registerSchema accepts valid input and normalizes the email', () => {
    const result = registerSchema.safeParse({
      name: 'Alice Smith',
      email: '  ALICE.SMITH@EXAMPLE.COM ',
      password: 'secret123',
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('alice.smith@example.com');
    expect(result.data.name).toBe('Alice Smith');
  });

  test('registerSchema rejects a short password and a missing email', () => {
    const shortPassword = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123',
    });
    expect(shortPassword.success).toBe(false);

    const badEmail = registerSchema.safeParse({
      name: 'Alice',
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(badEmail.success).toBe(false);
  });

  test('loginSchema requires both email and password', () => {
    expect(loginSchema.safeParse({ email: 'alice@example.com' }).success).toBe(false);
    expect(loginSchema.safeParse({ password: 'secret123' }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'alice@example.com', password: 'secret123' }).success
    ).toBe(true);
  });
});

describe('task validators (unit)', () => {
  test('taskCreateSchema requires a non-empty title', () => {
    expect(taskCreateSchema.safeParse({ title: '   ' }).success).toBe(false);
    expect(taskCreateSchema.safeParse({ title: 'Write tests' }).success).toBe(true);
  });

  test('taskCreateSchema only allows pending/completed status', () => {
    const ok = taskCreateSchema.safeParse({ title: 'A', status: 'completed' });
    expect(ok.success).toBe(true);

    const bad = taskCreateSchema.safeParse({ title: 'A', status: 'in_progress' });
    expect(bad.success).toBe(false);
  });

  test('taskUpdateSchema rejects an empty update payload', () => {
    expect(taskUpdateSchema.safeParse({ title: 'Changed' }).success).toBe(true);
    expect(taskUpdateSchema.safeParse({}).success).toBe(false);
  });
});