const prisma = require('../../src/database/prisma');

/**
 * Truncate all tables. Called in beforeEach of the API tests so every test
 * starts from a clean, predictable dataset.
 */
async function resetDatabase() {
  // Order matters (tasks reference users).
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

module.exports = { resetDatabase };