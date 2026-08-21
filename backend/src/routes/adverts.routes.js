const { Router } = require('express');
const advertsController = require('../controllers/adverts.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { updateStatusSchema, addNoteSchema } = require('../validators/adverts.validator');

const router = Router();

router.use(requireAuth);

router.get('/', advertsController.list);
router.get('/:id', advertsController.getById);
router.get('/:id/history', advertsController.history);
router.patch('/:id/status', requirePermission('ADVERTS_UPDATE_STATUS'), validateBody(updateStatusSchema), advertsController.updateStatus);
router.post('/:id/notes', requirePermission('ADVERTS_UPDATE_STATUS'), validateBody(addNoteSchema), advertsController.addNote);

module.exports = router;
