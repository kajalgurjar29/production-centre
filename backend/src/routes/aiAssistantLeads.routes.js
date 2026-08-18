const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const leadsController = require('../controllers/aiAssistantLeads.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { updateStatusSchema, createLeadSchema } = require('../validators/aiAssistantLeads.validator');

const router = Router();

// Public: called from the AI Assistant widget's pre-chat form - rate-limited
// per IP since it's an unauthenticated write, same tool used by /api/chat.
const leadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

router.post('/', leadLimiter, validateBody(createLeadSchema), leadsController.create);

// Admin-only from here down.
router.use(requireAuth);

router.get('/', leadsController.list);
router.patch('/:id/status', requirePermission('AI_LEADS_UPDATE_STATUS'), validateBody(updateStatusSchema), leadsController.updateStatus);

module.exports = router;
