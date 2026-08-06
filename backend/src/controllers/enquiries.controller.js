const asyncHandler = require('../utils/asyncHandler');
const enquiriesService = require('../services/enquiries.service');
const ApiError = require('../utils/ApiError');
const { ENQUIRY_SOURCES } = require('../constants/enquirySources');

const list = asyncHandler(async (req, res) => {
  const { status, source, page, pageSize } = req.query;
  const result = await enquiriesService.listEnquiries({
    status,
    source,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const updateStatus = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.setEnquiryStatus(req.params.id, req.body.status);
  res.json({ success: true, data: enquiry });
});

const create = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.createEnquiry(req.body);
  res.status(201).json({ success: true, data: enquiry });
});

const createForSource = asyncHandler(async (req, res) => {
  const slug = req.params.source.toLowerCase();
  const sourceName = ENQUIRY_SOURCES[slug];
  if (!sourceName) {
    throw ApiError.notFound(`Unknown enquiry source "${req.params.source}"`);
  }
  const enquiry = await enquiriesService.createEnquiry({ ...req.body, source: sourceName });
  res.status(201).json({ success: true, data: enquiry });
});

module.exports = { list, updateStatus, create, createForSource };
