const { z } = require('zod');

/** Task statuses exposed over the API (stored uppercase in the database). */
const TASK_STATUSES = ['pending', 'completed'];

const taskCreateSchema = z.object({
  title: z
    .string({ message: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  status: z.enum(TASK_STATUSES, { message: 'Status must be "pending" or "completed"' }).optional(),
});

const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .nullable(),
    status: z.enum(TASK_STATUSES, { message: 'Status must be "pending" or "completed"' }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (title, description or status) must be provided',
  });

const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Task id must be a positive integer'),
});

module.exports = { TASK_STATUSES, taskCreateSchema, taskUpdateSchema, taskIdParamSchema };