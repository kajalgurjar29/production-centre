const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// Fixed admin login that works even if the database is unreachable or unseeded
// (e.g. a freshly deployed server whose DB hasn't been migrated/seeded yet).
const STATIC_ADMIN = {
  id: 'static-admin',
  name: 'Admin',
  email: 'admin@gmail.com',
  password: 'Admin123',
  role: 'ADMINISTRATOR',
};

async function login(email, password) {
  // Prefer a real AdminUser row whenever the database is reachable, so
  // actions taken while logged in as admin@gmail.com attribute correctly
  // (audit log, password change, etc.) instead of resolving to the
  // no-such-row STATIC_ADMIN id. The static bypass below only kicks in if
  // the DB lookup fails outright or no active match is found there.
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (admin && admin.status === 'ACTIVE') {
      const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
      if (passwordMatches) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastActiveAt: new Date() },
        });
        const token = jwt.sign({ sub: admin.id, role: admin.role }, jwtSecret, { expiresIn: jwtExpiresIn });
        return {
          token,
          admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        };
      }
    }
  } catch (err) {
    console.error(`[auth] DB lookup failed during login, falling back to static admin if applicable: ${err.message}`);
  }

  if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
    const token = jwt.sign({ sub: STATIC_ADMIN.id, role: STATIC_ADMIN.role }, jwtSecret, { expiresIn: jwtExpiresIn });
    return {
      token,
      admin: { id: STATIC_ADMIN.id, name: STATIC_ADMIN.name, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
    };
  }

  throw ApiError.unauthorized('Invalid email or password');
}

async function getCurrentAdmin(adminId) {
  if (adminId === STATIC_ADMIN.id) {
    return { id: STATIC_ADMIN.id, name: STATIC_ADMIN.name, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role, status: 'ACTIVE', lastActiveAt: null };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, role: true, status: true, lastActiveAt: true },
  });
  if (!admin) throw ApiError.notFound('Admin account not found');
  return admin;
}

async function changePassword(adminId, currentPassword, newPassword) {
  if (adminId === STATIC_ADMIN.id) {
    throw ApiError.badRequest('Password change is not available for the built-in admin account');
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw ApiError.notFound('Admin account not found');

  const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!passwordMatches) throw ApiError.unauthorized('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({ where: { id: adminId }, data: { passwordHash } });
}

module.exports = { login, getCurrentAdmin, changePassword };
