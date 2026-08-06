const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/', paymentsController.list);
router.get('/:id', paymentsController.getById);

module.exports = router;
