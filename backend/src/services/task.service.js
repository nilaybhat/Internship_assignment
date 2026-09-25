const prisma = require('../database/prisma');
const ApiError = require('../utils/api-error');
const { TASK_STATUSES } = require('../validators/task.validator');

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Object-level authorization: a normal user may only access their own tasks,
 * while an admin may access any task.
 */
async function getOwnedTaskOrThrow(user, id) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  if (user.role !== 'ADMIN' && task.userId !== user.id) {
    throw new ApiError(403, 'Access denied: you can only manage your own tasks');
  }
  return task;
}

/** Map the API status string to the database enum value. */
function toDbStatus(status) {
  return status ? status.toUpperCase() : undefined;
}

/** Map a database row to the API representation (lowercase status). */
function toApiTask(task) {
  if (!task) return task;
  const { ...rest } = task;
  return { ...rest, status: task.status.toLowerCase() };
}

async function createTask(user, { title, description = '', status = 'pending' }) {
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      status: toDbStatus(status),
      userId: user.id,
    },
    select: TASK_SELECT,
  });
  return toApiTask(task);
}

/**
 * List tasks.
 *  - Admin: all tasks (with owner info)
 *  - Normal user: only their own tasks
 */
async function listTasks(user, { status } = {}) {
  const where = {
    ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
    ...(status ? { status: toDbStatus(status) } : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select:
      user.role === 'ADMIN'
        ? { ...TASK_SELECT, user: { select: { id: true, name: true, email: true } } }
        : TASK_SELECT,
  });

  return tasks.map(toApiTask);
}

async function updateTask(user, id, data) {
  await getOwnedTaskOrThrow(user, id);

  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined)
    patch.description = data.description === null ? null : data.description;
  if (data.status !== undefined) patch.status = toDbStatus(data.status);

  const task = await prisma.task.update({
    where: { id },
    data: patch,
    select: TASK_SELECT,
  });

  return toApiTask(task);
}

async function deleteTask(user, id) {
  await getOwnedTaskOrThrow(user, id);
  await prisma.task.delete({ where: { id } });
  return { id, deleted: true };
}

module.exports = {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  getOwnedTaskOrThrow,
  toApiTask,
  toDbStatus,
  TASK_STATUSES,
};