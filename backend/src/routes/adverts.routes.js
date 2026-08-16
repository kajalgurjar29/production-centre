const { Router } = require('express');
const advertsController = require('../controllers/adverts.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { updateStatusSchema } = require('../validators/adverts.validator');

const router = Router();

router.use(requireAuth);

router.get('/', advertsController.list);
router.get('/:id', advertsController.getById);
router.patch('/:id/status', validateBody(updateStatusSchema), advertsController.updateStatus);

module.exports = router;
