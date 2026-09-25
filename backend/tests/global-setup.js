/* global globalThis */
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

/**
 * Jest global setup.
 *  1. Loads .env.test so process.env.DATABASE_URL points at the test schema.
 *  2. Creates the dedicated test schema (if absent) so migrations never touch
 *     the real Supabase "public" data.
 *  3. Applies all Prisma migrations to the test schema.
 *
 * Run once per test invocation, before any test file is loaded.
 */
module.exports = async () => {
  const root = path.resolve(__dirname, '..');
  dotenv.config({ path: path.join(root, '.env.test') });

  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    throw new Error('TEST SETUP FAILED: DATABASE_URL missing. Create backend/.env.test.');
  }

  // Extract the schema name from the URL's ?schema= query parameter.
  const schemaParam = /[?&]schema=([^&]+)/.exec(DATABASE_URL);
  if (!schemaParam) {
    throw new Error(
      'TEST SETUP FAILED: DATABASE_URL must include ?schema=test so tests never run against the public schema.',
    );
  }
  const schema = decodeURIComponent(schemaParam[1]);

  // Create the schema before running migrations so DDL lands in it, not public.
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  } finally {
    await prisma.$disconnect();
  }

  execSync('npx prisma migrate deploy', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
  });

  // Required by Jest to satisfy the "global setup" contract.
  globalThis.__BEFORE_BOOTSTRAPPED__ = true;
};