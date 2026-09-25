const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .email('A valid email address is required')
    .toLowerCase(),
  password: z
    .string({ message: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .email('A valid email address is required')
    .toLowerCase(),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };