const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { sendMail } = require('../lib/mailer');

const SELECT_FIELDS = { id: true, name: true, email: true, role: true, status: true, lastActiveAt: true, createdAt: true };

// 12-char base64-derived password - matches prisma/seedAdmin.js so temp
// passwords look the same whether an admin is seeded from the CLI or invited
// through the UI.
function generateTempPassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
}

async function listAdminUsers() {
  return prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' }, select: SELECT_FIELDS });
}

async function inviteAdmin({ name, email, role }, actorId) {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An admin with this email already exists');

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const admin = await prisma.adminUser.create({
    data: { name, email, passwordHash, role, status: 'ACTIVE' },
    select: SELECT_FIELDS,
  });

  // The account is already created at this point - a mail failure (e.g. SMTP
  // unset) must not surface as a request failure, or the caller sees an error
  // while an orphaned account with an unknown password sits in the DB. Log the
  // temp password to the server console as a guaranteed fallback regardless of
  // whether sendMail's own dev-mode console fallback is active.
  let mailSent = true;
  try {
    await sendMail({
      to: email,
      subject: 'You have been added as an AppCentre admin',
      text: `Hi ${name},\n\nAn AppCentre admin account has been created for you with the role ${role}.\n\nEmail: ${email}\nTemporary password: ${tempPassword}\n\nLog in and change your password from My Profile as soon as possible.`,
      html: `<p>Hi ${name},</p><p>An AppCentre admin account has been created for you with the role <strong>${role}</strong>.</p><p>Email: ${email}<br/>Temporary password: <strong>${tempPassword}</strong></p><p>Log in and change your password from My Profile as soon as possible.</p>`,
    });
  } catch (err) {
    mailSent = false;
    console.error(`[adminUsers] Failed to email invite to ${email}: ${err.message}`);
    console.log(`[adminUsers] Temporary password for ${email}: ${tempPassword}`);
  }

  await logAction({ action: 'Admin user invited', target: `${email} (${role})`, actorId });

  return { ...admin, mailSent };
}

async function updateAdmin(id, data, actorId) {
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Admin user not found');
  if (id === actorId && data.status === 'DEACTIVATED') {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  const admin = await prisma.adminUser.update({ where: { id }, data, select: SELECT_FIELDS });
  await logAction({ action: 'Admin user updated', target: existing.email, actorId });
  return admin;
}

module.exports = { listAdminUsers, inviteAdmin, updateAdmin };
