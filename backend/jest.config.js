/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  // Tests share one PostgreSQL database, so workers must never run in parallel.
  maxWorkers: 1,
  // Loads .env.test and migrates the test database before the suite runs.
  globalSetup: '<rootDir>/tests/global-setup.js',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['src/server.js', 'prisma/'],
  verbose: true,
};