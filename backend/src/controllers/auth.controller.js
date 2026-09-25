const asyncHandler = require('../utils/async-handler');
const authService = require('../services/auth.service');

/** POST /api/auth/register */
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful. You can now log in.',
    data: user,
  });
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  res.json({ success: true, message: 'Login successful', token, user });
});

module.exports = { register, login };