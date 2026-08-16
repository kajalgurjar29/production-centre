const { Router } = require('express');
const auditLogController = require('../controllers/auditLog.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requirePermission } = require('../constants/permissions');

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('AUDIT_LOG_READ'), auditLogController.list);

module.exports = router;
