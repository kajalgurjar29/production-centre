const { Router } = require('express');
const homepageContentController = require('../controllers/homepageContent.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { updateBlockSchema } = require('../validators/homepageContent.validator');

const router = Router();

// Public: published homepage content blocks for a site.
router.get('/public', homepageContentController.listPublic);

// Admin-only from here down.
router.use(requireAuth);
const canWrite = requirePermission('HOMEPAGE_CONTENT_WRITE');

router.get('/', homepageContentController.list);
router.put('/:key', canWrite, validateBody(updateBlockSchema), homepageContentController.update);

module.exports = router;
