const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const validate = require('../validators/validate.middleware');
const { userIdParamSchema } = require('../validators/user.validator');

const router = Router();

// Every user route requires a valid JWT.
router.use(authenticate);

/** GET /api/users/me - own profile (any authenticated user). */
router.get('/me', userController.getProfile);

/** GET /api/users - list all users (admin only). */
router.get('/', requireAdmin, userController.listUsers);

/** DELETE /api/users/:id - delete a user (admin only). */
router.delete(
  '/:id',
  requireAdmin,
  validate(userIdParamSchema, 'params'),
  userController.deleteUser
);

module.exports = router;