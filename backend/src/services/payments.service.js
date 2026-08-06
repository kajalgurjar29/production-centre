const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listPayments({ status, page = 1, pageSize = 20 }) {
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { advert: { select: { id: true, title: true, reference: true } } },
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
