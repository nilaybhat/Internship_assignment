const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../validators/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = Router();

/**
 * POST /api/auth/register
 * { name, email, password }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * { email, password }
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;