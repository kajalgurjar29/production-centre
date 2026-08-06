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

module.exports = { login, me };
