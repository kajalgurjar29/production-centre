const asyncHandler = require('../utils/asyncHandler');
const homepageContentService = require('../services/homepageContent.service');

const DEFAULT_SITE_KEY = 'aitransformation';

const list = asyncHandler(async (req, res) => {
  const siteKey = req.query.siteKey || DEFAULT_SITE_KEY;
  const blocks = await homepageContentService.listBlocks(siteKey);
  res.json({ success: true, data: blocks });
});

const update = asyncHandler(async (req, res) => {
  const siteKey = req.query.siteKey || DEFAULT_SITE_KEY;
  const block = await homepageContentService.updateBlock(siteKey, req.params.key, req.body, req.admin.id);
  res.json({ success: true, data: block });
});

const listPublic = asyncHandler(async (req, res) => {
  const blocks = await homepageContentService.getPublicBlocks(req.query.source);
  res.json({ success: true, data: blocks });
});

module.exports = { list, update, listPublic };
