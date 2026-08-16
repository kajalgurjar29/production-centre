// Creates (or resets the password for) one real AdminUser so the admin panel
// has a working login independent of the STATIC_ADMIN dev bypass in
// auth.service.js, which is disabled whenever NODE_ENV=production. Idempotent -
// safe to run again; re-running rotates the password and prints the new one.
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function generatePassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@aitransformationprofessionals.com';
  const password = process.env.SEED_ADMIN_PASSWORD || generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: { name: 'Admin', email, passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });

  console.log(`Admin account ready: ${admin.email} (role: ${admin.role})`);
  console.log(`Password: ${password}`);
  console.log('This is only shown once - the hash is stored, not the plaintext. Log in at /admin, then change the password from My Profile.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
