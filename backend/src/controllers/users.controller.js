const asyncHandler = require('../utils/asyncHandler');
const usersService = require('../services/users.service');

const list = asyncHandler(async (req, res) => {
  const { search, status, page, pageSize } = req.query;
  const result = await usersService.listUsers({
    search,
    status,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.json({ success: true, data: user });
});

const create = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

const update = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
});

const suspend = asyncHandler(async (req, res) => {
  const user = await usersService.setUserStatus(req.params.id, 'SUSPENDED');
  res.json({ success: true, data: user });
});

const reinstate = asyncHandler(async (req, res) => {
  const user = await usersService.setUserStatus(req.params.id, 'ACTIVE');
  res.json({ success: true, data: user });
});

module.exports = { list, getById, create, update, suspend, reinstate };
