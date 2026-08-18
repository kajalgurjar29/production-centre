const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/adverts', require('./adverts.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/reviews', require('./reviews.routes'));
router.use('/enquiries', require('./enquiries.routes'));
router.use('/ai-assistant-leads', require('./aiAssistantLeads.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/knowledge/articles', require('./knowledgeArticles.routes'));
router.use('/knowledge/questions', require('./knowledgeQuestions.routes'));
router.use('/audit-log', require('./auditLog.routes'));
router.use('/admin-users', require('./adminUsers.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/homepage-content', require('./homepageContent.routes'));
router.use('/news', require('./news.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/public-auth', require('./publicAuth.routes'));

module.exports = router;
