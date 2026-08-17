const asyncHandler = require('../utils/asyncHandler');
const adminUsersService = require('../services/adminUsers.service');

const list = asyncHandler(async (req, res) => {
  const items = await adminUsersService.listAdminUsers();
  res.json({ success: true, data: { items } });
});

const invite = asyncHandler(async (req, res) => {
  const admin = await adminUsersService.inviteAdmin(req.body, req.admin.id);
  res.status(201).json({ success: true, data: admin });
});

const update = asyncHandler(async (req, res) => {
  const admin = await adminUsersService.updateAdmin(req.params.id, req.body, req.admin.id);
  res.json({ success: true, data: admin });
});

module.exports = { list, invite, update };
