const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/users.validator');

const router = Router();

router.use(requireAuth);

router.get('/', usersController.list);
router.get('/:id', usersController.getById);
router.post('/', validateBody(createUserSchema), usersController.create);
router.patch('/:id', validateBody(updateUserSchema), usersController.update);
router.post('/:id/suspend', requireRole('ADMINISTRATOR', 'SUPPORT'), usersController.suspend);
router.post('/:id/reinstate', requireRole('ADMINISTRATOR', 'SUPPORT'), usersController.reinstate);

module.exports = router;
