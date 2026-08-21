const asyncHandler = require('../utils/asyncHandler');
const advertsService = require('../services/adverts.service');

const list = asyncHandler(async (req, res) => {
  const { status, search, siteKey, page, pageSize } = req.query;
  const result = await advertsService.listAdverts({
    status,
    search,
    siteKey,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const advert = await advertsService.getAdvertById(req.params.id);
  res.json({ success: true, data: advert });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const advert = await advertsService.setAdvertStatus(req.params.id, status, req.admin.id, reason);
  res.json({ success: true, data: advert });
});

const history = asyncHandler(async (req, res) => {
  const entries = await advertsService.getAdvertHistory(req.params.id);
  res.json({ success: true, data: entries });
});

const addNote = asyncHandler(async (req, res) => {
  await advertsService.addAdvertNote(req.params.id, req.body.note, req.admin.id);
  res.status(201).json({ success: true, data: null });
});

module.exports = { list, getById, updateStatus, history, addNote };
