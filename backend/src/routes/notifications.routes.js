const { Router } = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { createNotificationSchema } = require('../validators/notifications.validator');

const router = Router();

router.use(requireAuth);

router.get('/', notificationsController.list);
router.post('/', requirePermission('NOTIFICATIONS_WRITE'), validateBody(createNotificationSchema), notificationsController.create);

module.exports = router;
