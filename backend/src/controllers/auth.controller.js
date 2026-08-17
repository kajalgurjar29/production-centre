const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  const admin = await authService.getCurrentAdmin(req.admin.id);
  res.json({ success: true, data: admin });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.admin.id, currentPassword, newPassword);
  res.json({ success: true, data: { message: 'Password updated' } });
});

module.exports = { login, me, changePassword };
