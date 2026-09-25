const { hashPassword, verifyPassword } = require('../../src/utils/password.util');

describe('password utils (unit)', () => {
  test('hashPassword produces a bcrypt hash, never the plain text', async () => {
    const plain = 's3cret-Passw0rd!';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
    expect(hash).not.toContain(plain);
  });

  test('verifyPassword accepts the correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct-horse-battery');

    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });
});