const asyncHandler = require('../utils/asyncHandler');
const newsService = require('../services/news.service');

const list = asyncHandler(async (req, res) => {
  const { status, search, siteKey } = req.query;
  const items = await newsService.listNews({ status, search, siteKey });
  res.json({ success: true, data: items });
});

const getById = asyncHandler(async (req, res) => {
  const item = await newsService.getNewsById(req.params.id);
  res.json({ success: true, data: item });
});

const listPublic = asyncHandler(async (req, res) => {
  const { source, limit } = req.query;
  const items = await newsService.listPublicNews({ siteKey: source, limit: limit ? parseInt(limit, 10) : undefined });
  res.json({ success: true, data: items });
});

const create = asyncHandler(async (req, res) => {
  const item = await newsService.createNews(req.body);
  res.status(201).json({ success: true, data: item });
});

const update = asyncHandler(async (req, res) => {
  const item = await newsService.updateNews(req.params.id, req.body);
  res.json({ success: true, data: item });
});

const publish = asyncHandler(async (req, res) => {
  const item = await newsService.setNewsStatus(req.params.id, 'PUBLISHED', req.admin.id);
  res.json({ success: true, data: item });
});

const schedule = asyncHandler(async (req, res) => {
  const item = await newsService.setNewsStatus(req.params.id, 'SCHEDULED', req.admin.id);
  res.json({ success: true, data: item });
});

const archive = asyncHandler(async (req, res) => {
  const item = await newsService.setNewsStatus(req.params.id, 'ARCHIVED', req.admin.id);
  res.json({ success: true, data: item });
});

const remove = asyncHandler(async (req, res) => {
  await newsService.removeNews(req.params.id, req.admin.id);
  res.json({ success: true, data: null });
});

module.exports = { list, getById, listPublic, create, update, publish, schedule, archive, remove };
