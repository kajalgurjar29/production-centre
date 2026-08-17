const asyncHandler = require('../utils/asyncHandler');
const enquiriesService = require('../services/enquiries.service');
const ApiError = require('../utils/ApiError');
const { SITE_SOURCES } = require('../constants/siteSources');

const list = asyncHandler(async (req, res) => {
  const { status, source, siteKey, page, pageSize } = req.query;
  const result = await enquiriesService.listEnquiries({
    status,
    source,
    siteKey,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const updateStatus = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.setEnquiryStatus(req.params.id, req.body.status, req.admin.id);
  res.json({ success: true, data: enquiry });
});

const create = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.createEnquiry(req.body);
  res.status(201).json({ success: true, data: enquiry });
});

const createForSource = asyncHandler(async (req, res) => {
  const slug = req.params.source.toLowerCase();
  const sourceName = SITE_SOURCES[slug];
  if (!sourceName) {
    throw ApiError.notFound(`Unknown enquiry source "${req.params.source}"`);
  }
  const enquiry = await enquiriesService.createEnquiry({ ...req.body, source: sourceName, siteKey: slug });
  res.status(201).json({ success: true, data: enquiry });
});

module.exports = { list, updateStatus, create, createForSource };
