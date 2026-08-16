const asyncHandler = require('../utils/asyncHandler');
const notificationsService = require('../services/notifications.service');

const list = asyncHandler(async (req, res) => {
  const { audience, page, pageSize } = req.query;
  const result = await notificationsService.listNotifications({
    audience,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  });
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const notification = await notificationsService.sendNotification({ ...req.body, actorId: req.admin.id });
  res.status(201).json({ success: true, data: notification });
});

module.exports = { list, create };
