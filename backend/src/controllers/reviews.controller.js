const asyncHandler = require('../utils/asyncHandler');
const reviewsService = require('../services/reviews.service');
const ApiError = require('../utils/ApiError');
const { SITE_SOURCES } = require('../constants/siteSources');

const list = asyncHandler(async (req, res) => {
  const { status, search, siteKey, page, pageSize } = req.query;
  const result = await reviewsService.listReviews({
    status,
    search,
    siteKey,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const review = await reviewsService.removeReview(req.params.id, req.admin.id);
  res.json({ success: true, data: review });
});

const updateStatus = asyncHandler(async (req, res) => {
  const review = await reviewsService.setReviewStatus(req.params.id, req.body.status, req.admin.id);
  res.json({ success: true, data: review });
});

const create = asyncHandler(async (req, res) => {
  const slug = req.params.source.toLowerCase();
  if (!SITE_SOURCES[slug]) {
    throw ApiError.notFound(`Unknown review source "${req.params.source}"`);
  }
  const imageUrl = req.file ? `/uploads/reviews/${req.file.filename}` : undefined;
  const review = await reviewsService.createReview({ ...req.body, imageUrl, siteKey: slug });
  res.status(201).json({ success: true, data: review });
});

const listPublic = asyncHandler(async (req, res) => {
  const slug = req.params.source.toLowerCase();
  const items = await reviewsService.listPublicApprovedReviews(slug);
  res.json({ success: true, data: { items } });
});

module.exports = { list, remove, updateStatus, create, listPublic };
