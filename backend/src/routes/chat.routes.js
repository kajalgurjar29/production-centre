const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chat.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { chatSchema } = require('../validators/chat.validator');

const router = Router();

// Public endpoint (used by the unauthenticated Help widget on the user panel) —
// rate-limited per IP to guard against runaway OpenAI usage/cost.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

router.post('/', chatLimiter, validateBody(chatSchema), chatController.sendMessage);

module.exports = router;
