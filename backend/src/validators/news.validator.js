const { z } = require('zod');

const createNewsSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  summary: z.string().trim().max(500).optional(),
  body: z.string().trim().min(1, 'body is required'),
  imageUrl: z.string().trim().optional(),
  featured: z.boolean().optional(),
  publishAt: z.string().optional(),
  // Omitted/null = Shared AppCentre news, visible on every site.
  siteKey: z.string().trim().min(1).optional().nullable(),
});

const updateNewsSchema = createNewsSchema.partial();

module.exports = { createNewsSchema, updateNewsSchema };
