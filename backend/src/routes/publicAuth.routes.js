const { Router } = require('express');
const publicAuthController = require('../controllers/publicAuth.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { registerSchema, requestOtpSchema, verifyOtpSchema } = require('../validators/publicAuth.validator');

const router = Router();

router.post('/register', validateBody(registerSchema), publicAuthController.register);
router.post('/otp/request', validateBody(requestOtpSchema), publicAuthController.requestOtp);
router.post('/otp/verify', validateBody(verifyOtpSchema), publicAuthController.verifyOtp);

module.exports = router;
