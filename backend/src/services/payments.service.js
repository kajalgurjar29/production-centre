const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { resolveSiteId } = require('../utils/resolveSiteId');

// Payment has no siteId of its own - it only reaches a site through its
// Advert relation (same relation-filter approach dashboard.service.js
// already uses for the same reason).
async function listPayments({ status, siteKey, page = 1, pageSize = 20 }) {
  const siteId = siteKey ? await resolveSiteId(siteKey) : undefined;
  const where = {
    AND: [status ? { status } : {}, siteId !== undefined ? { advert: { siteId } } : {}],
  };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { advert: { select: { id: true, title: true, reference: true, advertiser: { select: { id: true, name: true, email: true } } } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function getPaymentById(id) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { advert: { include: { advertiser: true } } },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  return payment;
}

module.exports = { listPayments, getPaymentById };
