const asyncHandler = require('../utils/asyncHandler');
const reviewsService = require('../services/reviews.service');

const list = asyncHandler(async (req, res) => {
  const { status, search, page, pageSize } = req.query;
  const result = await reviewsService.listReviews({
    status,
    search,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const review = await reviewsService.removeReview(req.params.id);
  res.json({ success: true, data: review });
});

module.exports = { list, remove };
