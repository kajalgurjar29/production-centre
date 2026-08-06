const { Router } = require('express');
const reviewsController = require('../controllers/reviews.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/', reviewsController.list);
router.delete('/:id', reviewsController.remove);

module.exports = router;
