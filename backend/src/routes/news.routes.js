const { Router } = require('express');
const newsController = require('../controllers/news.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { createNewsSchema, updateNewsSchema } = require('../validators/news.validator');

const router = Router();

// Public: news carousel data for a site's homepage.
router.get('/public', newsController.listPublic);

// Admin-only from here down.
router.use(requireAuth);
const canWrite = requirePermission('NEWS_WRITE');

router.get('/', newsController.list);
router.get('/:id', newsController.getById);
router.post('/', canWrite, validateBody(createNewsSchema), newsController.create);
router.put('/:id', canWrite, validateBody(updateNewsSchema), newsController.update);
router.post('/:id/publish', canWrite, newsController.publish);
router.post('/:id/schedule', canWrite, newsController.schedule);
router.post('/:id/archive', canWrite, newsController.archive);
router.delete('/:id', canWrite, newsController.remove);

module.exports = router;
