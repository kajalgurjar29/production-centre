const asyncHandler = require('../utils/asyncHandler');
const auditLogService = require('../services/auditLog.service');

const list = asyncHandler(async (req, res) => {
  const { actor, action, page, pageSize } = req.query;
  const result = await auditLogService.listAuditLog({
    actor,
    action,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

module.exports = { list };
