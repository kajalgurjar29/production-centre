const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum([
    'DRAFT', 'PAYMENT_REQUIRED', 'PENDING_REVIEW', 'AMENDMENTS_REQUIRED',
    'APPROVED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REMOVED',
  ]),
  reason: z.string().optional(),
});

module.exports = { updateStatusSchema };
