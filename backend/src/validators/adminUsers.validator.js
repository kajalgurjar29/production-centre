const { z } = require('zod');

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'READONLY_AUDITOR'];

const inviteAdminSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email(),
  role: z.enum(ADMIN_ROLES),
});

const updateAdminSchema = z
  .object({
    role: z.enum(ADMIN_ROLES).optional(),
    status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
  })
  .refine((data) => data.role || data.status, { message: 'Provide a role or status to update' });

module.exports = { ADMIN_ROLES, inviteAdminSchema, updateAdminSchema };
