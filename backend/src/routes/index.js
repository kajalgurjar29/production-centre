const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/adverts', require('./adverts.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/reviews', require('./reviews.routes'));
router.use('/enquiries', require('./enquiries.routes'));

module.exports = router;
