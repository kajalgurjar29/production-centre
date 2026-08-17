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
  if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
    const token = jwt.sign({ sub: STATIC_ADMIN.id, role: STATIC_ADMIN.role }, jwtSecret, { expiresIn: jwtExpiresIn });
    return {
      token,
      admin: { id: STATIC_ADMIN.id, name: STATIC_ADMIN.name, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
    };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || admin.status !== 'ACTIVE') {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

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
