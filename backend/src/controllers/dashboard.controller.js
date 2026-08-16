const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const summary = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const result = await dashboardService.getSummary(period);
  res.json({ success: true, data: result });
});

module.exports = { summary };
