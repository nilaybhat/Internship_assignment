const asyncHandler = require('../utils/async-handler');
const taskService = require('../services/task.service');

/** POST /api/tasks */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user, req.body);
  res.status(201).json({ success: true, message: 'Task created', data: task });
});

/** GET /api/tasks */
const listTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks(req.user, {
    status: req.query.status,
  });
  res.json({ success: true, data: tasks });
});

/** PUT /api/tasks/:id */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user, req.params.id, req.body);
  res.json({ success: true, message: 'Task updated', data: task });
});

/** DELETE /api/tasks/:id */
const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.user, req.params.id);
  res.json({ success: true, message: 'Task deleted', data: result });
});

module.exports = { createTask, listTasks, updateTask, deleteTask };