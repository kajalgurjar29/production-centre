const { z } = require('zod');

const createAdvertTypeSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  price: z.number().nonnegative(),
  durationDays: z.number().int().positive(),
  placement: z.string().trim().min(1, 'placement is required'),
  enabled: z.boolean().optional(),
});

const updateAdvertTypeSchema = createAdvertTypeSchema.partial();

module.exports = { createAdvertTypeSchema, updateAdvertTypeSchema };
