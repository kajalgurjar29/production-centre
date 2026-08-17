const { z } = require('zod');

// Per-site endpoint (POST /api/reviews/:source) - source comes from the URL,
// not the body, so it isn't part of this schema at all.
const createReviewBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  // multipart/form-data (used when a photo is attached) always sends string
  // field values, unlike JSON - coerce so both submission paths validate.
  rating: z.coerce.number().int().min(1).max(5),
  topic: z.string().max(100).optional(),
  details: z.string().max(800).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

const updateReviewStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN']),
});

module.exports = { createReviewBodySchema, updateReviewStatusSchema };
