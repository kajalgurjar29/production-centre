const { Router } = require('express');
const reviewsController = require('../controllers/reviews.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { reviewImageUpload } = require('../middleware/upload.middleware');
const { createReviewBodySchema, updateReviewStatusSchema } = require('../validators/reviews.validator');

const router = Router();

// Public: visitor-facing submission and approved-only display feed.
router.post('/:source', reviewImageUpload, validateBody(createReviewBodySchema), reviewsController.create);
router.get('/site/:source', reviewsController.listPublic);

// Admin-only from here down.
router.use(requireAuth);

router.get('/', reviewsController.list);
router.patch('/:id/status', requirePermission('REVIEWS_UPDATE_STATUS'), validateBody(updateReviewStatusSchema), reviewsController.updateStatus);
router.delete('/:id', reviewsController.remove);

module.exports = router;
