const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), authController.changePassword);

module.exports = router;
