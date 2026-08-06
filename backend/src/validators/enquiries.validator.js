const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED']),
});

const enquiryFields = {
  title: z.string().max(20).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('A valid email is required'),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  enquiryType: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
};

const nameAndSubjectRefinements = (schema) =>
  schema
    .refine((data) => data.name || (data.firstName && data.lastName), {
      message: 'Provide either "name", or both "firstName" and "lastName"',
      path: ['name'],
    })
    .refine((data) => data.subject || data.enquiryType, {
      message: 'Provide either "subject" or "enquiryType"',
      path: ['subject'],
    });

// Generic endpoint (POST /api/enquiries) - caller must say where it's from.
const createEnquirySchema = nameAndSubjectRefinements(
  z.object({ ...enquiryFields, source: z.string().min(1, 'Source is required').max(100) })
);

// Per-site endpoint (POST /api/enquiries/:source) - source comes from the URL,
// not the body, so it isn't part of this schema at all.
const createEnquiryBodySchema = nameAndSubjectRefinements(z.object({ ...enquiryFields }));

module.exports = { updateStatusSchema, createEnquirySchema, createEnquiryBodySchema };
