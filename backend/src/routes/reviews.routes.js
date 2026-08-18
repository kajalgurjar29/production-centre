const { Router } = require('express');
const rateLimit = require('express-rate-limit');
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

// Public: like/report an approved review - unauthenticated (no visitor
// accounts exist for reviews), so rate-limited per IP against spam, same
// tool used by the other public write endpoints (chat, enquiries, leads).
const reviewActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
router.post('/:id/like', reviewActionLimiter, reviewsController.like);
router.post('/:id/report', reviewActionLimiter, reviewsController.report);

// Admin-only from here down.
router.use(requireAuth);

router.get('/', reviewsController.list);
router.patch('/:id/status', requirePermission('REVIEWS_UPDATE_STATUS'), validateBody(updateReviewStatusSchema), reviewsController.updateStatus);
router.delete('/:id', reviewsController.remove);

module.exports = router;
