const prisma = require('../database/prisma');
const ApiError = require('../utils/api-error');
const { hashPassword, verifyPassword } = require('../utils/password.util');
const { signToken } = require('../utils/jwt.util');

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

/**
 * Register a new user. Returns the safe user object (password excluded).
 */
async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: USER_SELECT,
  });

  return user;
}

/**
 * Authenticate a user with email + password. Returns a JWT and the safe
 * user object. Uses a generic error message ("Invalid email or password")
 * to avoid leaking which field was wrong.
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await verifyPassword(password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ sub: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = { register, login };