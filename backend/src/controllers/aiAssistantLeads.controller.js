const asyncHandler = require('../utils/asyncHandler');
const leadsService = require('../services/aiAssistantLeads.service');

const list = asyncHandler(async (req, res) => {
  const { status, siteKey, page, pageSize } = req.query;
  const result = await leadsService.listLeads({
    status,
    siteKey,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const updateStatus = asyncHandler(async (req, res) => {
  const lead = await leadsService.setLeadStatus(req.params.id, req.body.status, req.admin.id);
  res.json({ success: true, data: lead });
});

const create = asyncHandler(async (req, res) => {
  const lead = await leadsService.createLead(req.body);
  res.status(201).json({ success: true, data: lead });
});

module.exports = { list, updateStatus, create };
