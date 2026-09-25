const { Router } = require('express');
const taskController = require('../controllers/task.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../validators/validate.middleware');
const {
  taskCreateSchema,
  taskUpdateSchema,
  taskIdParamSchema,
} = require('../validators/task.validator');

const router = Router();

// Every task route requires a valid JWT.
router.use(authenticate);

/** POST /api/tasks */
router.post('/', validate(taskCreateSchema), taskController.createTask);

/** GET /api/tasks?status=pending|completed */
router.get('/', taskController.listTasks);

/** PUT /api/tasks/:id */
router.put(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(taskUpdateSchema),
  taskController.updateTask
);

/** DELETE /api/tasks/:id */
router.delete('/:id', validate(taskIdParamSchema, 'params'), taskController.deleteTask);

module.exports = router;