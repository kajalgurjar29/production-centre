const { z } = require('zod');
const { USER_TITLES } = require('../constants/userTitles');

const registerSchema = z
  .object({
    title: z.enum(Object.keys(USER_TITLES)),
    firstName: z.string().min(1, 'First name is required').max(100),
    surname: z.string().min(1, 'Surname is required').max(100),
    email: z.string().email('A valid email is required'),
    confirmEmail: z.string().email('A valid email is required'),
    sex: z.string().max(20).optional(),
  })
  .refine((data) => data.email.toLowerCase() === data.confirmEmail.toLowerCase(), {
    message: 'Email and confirmation email must match',
    path: ['confirmEmail'],
  });

const requestOtpSchema = z.object({
  email: z.string().email('A valid email is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('A valid email is required'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

module.exports = { registerSchema, requestOtpSchema, verifyOtpSchema };
