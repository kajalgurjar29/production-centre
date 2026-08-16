const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/summary', dashboardController.summary);

module.exports = router;
