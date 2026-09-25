const { z } = require('zod');

const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive('User id must be a positive integer'),
});

module.exports = { userIdParamSchema };