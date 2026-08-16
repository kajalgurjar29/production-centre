const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { createUserSchema, updateUserSchema } = require('../validators/users.validator');

const router = Router();

router.use(requireAuth);

router.get('/', usersController.list);
router.get('/:id', usersController.getById);
router.post('/', validateBody(createUserSchema), usersController.create);
router.patch('/:id', validateBody(updateUserSchema), usersController.update);
router.post('/:id/suspend', requirePermission('USERS_SUSPEND'), usersController.suspend);
router.post('/:id/reinstate', requirePermission('USERS_REINSTATE'), usersController.reinstate);

module.exports = router;
