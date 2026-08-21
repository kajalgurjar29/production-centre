const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum([
    'DRAFT', 'PAYMENT_REQUIRED', 'PENDING_REVIEW', 'AMENDMENTS_REQUIRED',
    'APPROVED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REMOVED',
  ]),
  reason: z.string().optional(),
});

const addNoteSchema = z.object({
  note: z.string().trim().min(1, 'note is required'),
});

module.exports = { updateStatusSchema, addNoteSchema };
