const { Router } = require('express');
const enquiriesController = require('../controllers/enquiries.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { updateStatusSchema, createEnquirySchema, createEnquiryBodySchema } = require('../validators/enquiries.validator');

const router = Router();

// Public: generic endpoint - caller specifies source explicitly in the body.
router.post('/', validateBody(createEnquirySchema), enquiriesController.create);

// Public: per-site endpoint - source comes from the URL (e.g. .../enquiries/aitransformation),
// so an integrator can't send an inconsistent or typo'd source string.
router.post('/:source', validateBody(createEnquiryBodySchema), enquiriesController.createForSource);

// Admin-only from here down.
router.use(requireAuth);

router.get('/', enquiriesController.list);
router.patch('/:id/status', requirePermission('ENQUIRIES_UPDATE_STATUS'), validateBody(updateStatusSchema), enquiriesController.updateStatus);

module.exports = router;
