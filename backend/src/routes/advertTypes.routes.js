const { Router } = require('express');
const advertTypesController = require('../controllers/advertTypes.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { createAdvertTypeSchema, updateAdvertTypeSchema } = require('../validators/advertTypes.validator');

const router = Router();

router.use(requireAuth);
const canWrite = requirePermission('ADVERTS_MANAGE_TYPES');

router.get('/', advertTypesController.list);
router.get('/:id', advertTypesController.getById);
router.post('/', canWrite, validateBody(createAdvertTypeSchema), advertTypesController.create);
router.put('/:id', canWrite, validateBody(updateAdvertTypeSchema), advertTypesController.update);

module.exports = router;
