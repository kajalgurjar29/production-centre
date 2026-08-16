const { z } = require('zod');

const updateBlockSchema = z.object({
  headline: z.string().trim().max(300).optional(),
  subtext: z.string().trim().max(1000).optional(),
  ctaLabel: z.string().trim().max(100).optional(),
  published: z.boolean().optional(),
});

module.exports = { updateBlockSchema };
