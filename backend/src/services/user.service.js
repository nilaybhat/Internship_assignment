const prisma = require('../database/prisma');
const ApiError = require('../utils/api-error');

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { tasks: true } },
};

/** Profile of the currently authenticated user. */
async function getProfile(user) {
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: SAFE_USER_SELECT,
  });
  if (!profile) {
    throw new ApiError(404, 'User not found');
  }
  return profile;
}

/** List every user (admin only), including their task counts. */
async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: SAFE_USER_SELECT,
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    taskCount: user._count.tasks,
  }));
}

/** Delete a user (admin only). Cascades to their tasks. */
async function deleteUser(actor, id) {
  if (actor.id === id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'ADMIN') {
    throw new ApiError(403, 'Access denied: admin accounts cannot be deleted');
  }

  await prisma.user.delete({ where: { id } });
  return { id, deleted: true };
}

module.exports = { getProfile, listUsers, deleteUser };