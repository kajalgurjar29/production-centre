const { Router } = require('express');
const questionsController = require('../controllers/knowledgeQuestions.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/', questionsController.list);
router.post('/:id/review', questionsController.review);

module.exports = router;
