const asyncHandler = require('../utils/asyncHandler');
const advertTypesService = require('../services/advertTypes.service');

const list = asyncHandler(async (req, res) => {
  const items = await advertTypesService.listAdvertTypes();
  res.json({ success: true, data: items });
});

const getById = asyncHandler(async (req, res) => {
  const item = await advertTypesService.getAdvertTypeById(req.params.id);
  res.json({ success: true, data: item });
});

const create = asyncHandler(async (req, res) => {
  const item = await advertTypesService.createAdvertType(req.body, req.admin.id);
  res.status(201).json({ success: true, data: item });
});

const update = asyncHandler(async (req, res) => {
  const item = await advertTypesService.updateAdvertType(req.params.id, req.body, req.admin.id);
  res.json({ success: true, data: item });
});

module.exports = { list, getById, create, update };
