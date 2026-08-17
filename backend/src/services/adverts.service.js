const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');

async function listAdverts({ status, search, page = 1, pageSize = 20 }) {
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

module.exports = { listAdverts, getAdvertById, setAdvertStatus };
