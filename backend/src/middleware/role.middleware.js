const ApiError = require('../utils/api-error');

/**
 * Role-based authorization middleware factory.
 * `requireRole('ADMIN')` guards admin-only routes.
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied: insufficient permissions'));
    }
    return next();
  };
}

const requireAdmin = requireRole('ADMIN');

module.exports = { requireRole, requireAdmin };