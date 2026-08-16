const prisma = require('../config/prisma');

// Recipients aren't stored individually (no per-user inbox exists yet) - a
// notification is a broadcast record with a recipient count snapshotted at
// send time, matching what the admin UI has always shown ("Audience · Status: Sent").
async function countAudience(audience) {
  if (audience === 'ALL_USERS') return prisma.user.count();
  if (audience === 'ADVERTISERS') return prisma.user.count({ where: { adverts: { some: {} } } });
  return prisma.adminUser.count({ where: { status: 'ACTIVE' } });
}

async function sendNotification({ audience, title, message, actorId }) {
  const recipientCount = await countAudience(audience);
  return prisma.notification.create({
    data: { audience, title, message, recipientCount, status: 'SENT', createdById: actorId },
  });
}

async function listNotifications({ audience, page = 1, pageSize = 20 }) {
  const where = audience ? { audience } : {};
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.notification.count({ where }),
  ]);
  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

module.exports = { sendNotification, listNotifications };
