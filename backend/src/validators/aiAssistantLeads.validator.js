const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']),
});

const createLeadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  email: z.string().trim().min(1, 'Email is required').email('A valid email is required').max(200),
  sessionId: z.string().max(200).optional(),
  siteKey: z.string().max(100).optional(),
});

module.exports = { updateStatusSchema, createLeadSchema };
