const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

async function login(email, password) {
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
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, role: true, status: true, lastActiveAt: true },
  });
  if (!admin) throw ApiError.notFound('Admin account not found');
  return admin;
}

module.exports = { login, getCurrentAdmin };
