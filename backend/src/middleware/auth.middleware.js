const ApiError = require('../utils/api-error');
const { verifyToken } = require('../utils/jwt.util');
const prisma = require('../database/prisma');

/**
 * Authentication middleware.
 * Requires an `Authorization: Bearer <token>` header, verifies the JWT and
 * attaches the current user to `req.user`. Running in an async try/catch
 * so authentication failures are handled by the error middleware.
 */
async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required: missing Bearer token');
    }

    const token = header.slice('Bearer '.length).trim();

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticate;