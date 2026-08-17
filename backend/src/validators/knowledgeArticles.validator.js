const { z } = require('zod');

const createArticleSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  category: z.string().trim().min(1, 'category is required'),
  answer: z.string().trim().min(1, 'answer is required'),
  keywords: z.string().trim().optional(),
  updatedBy: z.string().optional(),
  sourceQuestionId: z.string().optional(),
  // Omitted/null = Shared AppCentre knowledge, visible to every site.
  siteKey: z.string().trim().min(1).optional().nullable(),
});

const updateArticleSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  answer: z.string().trim().min(1).optional(),
  keywords: z.string().trim().optional(),
  updatedBy: z.string().optional(),
  siteKey: z.string().trim().min(1).optional().nullable(),
});

const setStatusSchema = z.object({
  updatedBy: z.string().optional(),
  sourceQuestionId: z.string().optional(),
});

module.exports = { createArticleSchema, updateArticleSchema, setStatusSchema };
