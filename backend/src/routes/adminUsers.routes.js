const { Router } = require('express');
const adminUsersController = require('../controllers/adminUsers.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { requirePermission } = require('../constants/permissions');
const { inviteAdminSchema, updateAdminSchema } = require('../validators/adminUsers.validator');

const router = Router();

router.use(requireAuth);
router.use(requirePermission('ADMIN_USERS_WRITE'));

router.get('/', adminUsersController.list);
router.post('/invite', validateBody(inviteAdminSchema), adminUsersController.invite);
router.patch('/:id', validateBody(updateAdminSchema), adminUsersController.update);

module.exports = router;
