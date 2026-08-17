const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { resolveSiteId } = require('../utils/resolveSiteId');
const { SITE_SOURCES } = require('../constants/siteSources');

async function listReviews({ status, search, siteKey, page = 1, pageSize = 20 }) {
  const where = {
    AND: [
      status ? { status } : {},
      search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { details: { contains: search, mode: 'insensitive' } }] } : {},
      siteKey ? { site: { siteKey } } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { site: { select: { siteKey: true, siteName: true } } },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function removeReview(id, actorId) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound('Review not found');
  const updated = await prisma.review.update({ where: { id }, data: { status: 'HIDDEN' } });
  await logAction({ action: 'Review status changed to HIDDEN', target: review.name, actorId });
  return updated;
}

async function setReviewStatus(id, status, actorId) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound('Review not found');

  const updated = await prisma.review.update({ where: { id }, data: { status } });
  await logAction({ action: `Review status changed to ${status}`, target: review.name, actorId });
  return updated;
}

// siteKey is the URL slug used in POST /api/reviews/:source (e.g.
// "aitransformation"), which is also the Site.siteKey.
async function createReview({ name, rating, topic, details, country, city, imageUrl, siteKey }) {
  const sourceName = SITE_SOURCES[siteKey] || 'AppCentre';
  const siteId = siteKey ? await resolveSiteId(siteKey) : null;

  return prisma.review.create({
    data: { name, rating, topic, details, country, city, imageUrl, source: sourceName, siteId, status: 'PENDING' },
  });
}

// Public display feed - only ever Approved, and only for the requesting site.
async function listPublicApprovedReviews(siteKey) {
  const siteId = await resolveSiteId(siteKey);
  if (!siteId) return [];
  return prisma.review.findMany({
    where: { siteId, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

module.exports = { listReviews, removeReview, setReviewStatus, createReview, listPublicApprovedReviews };
