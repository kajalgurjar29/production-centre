const { Router } = require('express');
const articlesController = require('../controllers/knowledgeArticles.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { createArticleSchema, updateArticleSchema, setStatusSchema } = require('../validators/knowledgeArticles.validator');

const router = Router();

router.use(requireAuth);

router.get('/', articlesController.list);
router.get('/:id', articlesController.getById);
router.post('/', validateBody(createArticleSchema), articlesController.create);
router.put('/:id', validateBody(updateArticleSchema), articlesController.update);
router.post('/:id/publish', validateBody(setStatusSchema), articlesController.publish);
router.post('/:id/deactivate', validateBody(setStatusSchema), articlesController.deactivate);
router.post('/:id/reactivate', validateBody(setStatusSchema), articlesController.reactivate);

module.exports = router;
