const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { resolveSiteId } = require('../utils/resolveSiteId');

async function listAdverts({ status, search, siteKey, page = 1, pageSize = 20 }) {
  const siteId = siteKey ? await resolveSiteId(siteKey) : undefined;
  const where = {
    AND: [
      status ? { status } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { reference: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      siteId !== undefined ? { siteId } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.advert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { advertiser: { select: { id: true, name: true, email: true } } },
    }),
    prisma.advert.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function getAdvertById(id) {
  const advert = await prisma.advert.findUnique({
    where: { id },
    include: { advertiser: true, payments: true },
  });
  if (!advert) throw ApiError.notFound('Advert not found');
  return advert;
}

async function setAdvertStatus(id, status, actorId, reason) {
  await getAdvertById(id);
  const advert = await prisma.advert.update({ where: { id }, data: { status } });
  await logAction({ action: `Advert status changed to ${status}`, target: advert.reference, reason, actorId });
  return advert;
}

async function getAdvertHistory(id) {
  const advert = await getAdvertById(id);
  return prisma.auditLog.findMany({
    where: { target: advert.reference },
    orderBy: { createdAt: 'desc' },
    include: { actor: { select: { name: true } } },
  });
}

async function addAdvertNote(id, note, actorId) {
  const advert = await getAdvertById(id);
  await logAction({ action: 'Internal note added', target: advert.reference, reason: note, actorId });
}

module.exports = { listAdverts, getAdvertById, setAdvertStatus, getAdvertHistory, addAdvertNote };
