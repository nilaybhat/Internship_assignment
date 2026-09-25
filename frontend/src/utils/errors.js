/**
 * Extract a human-readable message from an API / network error.
 * Backend validation errors carry a `details` array of field-level messages.
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;

  if (data?.message) {
    const details = Array.isArray(data.details) && data.details.length ? data.details : null;
    if (details) {
      const fields = details.map((d) => d.message || d.field).filter(Boolean);
      return fields.join(' ');
    }
    return data.message;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Check that the backend is running.';
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}