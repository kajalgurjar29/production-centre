const asyncHandler = require('../utils/asyncHandler');
const paymentsService = require('../services/payments.service');

const list = asyncHandler(async (req, res) => {
  const { status, siteKey, page, pageSize } = req.query;
  const result = await paymentsService.listPayments({
    status,
    siteKey,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const payment = await paymentsService.getPaymentById(req.params.id);
  res.json({ success: true, data: payment });
});

module.exports = { list, getById };
