const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const summary = asyncHandler(async (req, res) => {
  const { period, siteKey } = req.query;
  const result = await dashboardService.getSummary(period, siteKey);
  res.json({ success: true, data: result });
});

module.exports = { summary };
