const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listReviews({ status, search, page = 1, pageSize = 20 }) {
  const where = {
    AND: [
      status ? { status } : {},
      search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { details: { contains: search, mode: 'insensitive' } }] } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.review.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function removeReview(id) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound('Review not found');
  return prisma.review.update({ where: { id }, data: { status: 'REMOVED' } });
}

module.exports = { listReviews, removeReview };
