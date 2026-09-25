const ApiError = require('../utils/api-error');

/**
 * Zod validation middleware. Validates the given request source
 * (default "body") against a schema and produces a 400 with
 * field-level error details on failure.
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    // Replace the raw input with the validated/coerced value.
    req[source] = result.data;
    return next();
  };
}

module.exports = validate;