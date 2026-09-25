const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

const NODE_ENV = process.env.NODE_ENV || 'development';

// Load the correct env file for the current environment.
//  - development -> .env
//  - test        -> .env.test
//  - production  -> .env
dotenv.config({ path: path.resolve(process.cwd(), NODE_ENV === 'test' ? '.env.test' : '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast when required configuration is missing (skills: Configuration & Environment).
  console.error('Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

module.exports = Object.freeze(parsed.data);