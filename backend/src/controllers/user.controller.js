const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

/** GET /api/users/me - the authenticated user's profile. */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user);
  res.json({ success: true, data: profile });
});

/** GET /api/users - list all users (admin only). */
const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json({ success: true, data: users });
});

/** DELETE /api/users/:id - delete a user (admin only). */
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.user, req.params.id);
  res.json({ success: true, message: 'User deleted', data: result });
});

module.exports = { getProfile, listUsers, deleteUser };