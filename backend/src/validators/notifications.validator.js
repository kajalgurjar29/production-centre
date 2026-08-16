const { z } = require('zod');

const createNotificationSchema = z.object({
  audience: z.enum(['ALL_USERS', 'ADVERTISERS', 'ADMINISTRATORS']),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000),
});

module.exports = { createNotificationSchema };
