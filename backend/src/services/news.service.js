const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { resolveSiteId } = require('../utils/resolveSiteId');

async function listNews({ status, search }) {
  const where = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: 'insensitive' };
  return prisma.news.findMany({ where, orderBy: { createdAt: 'desc' }, include: { site: { select: { siteName: true } } } });
}

async function getNewsById(id) {
  const item = await prisma.news.findUnique({ where: { id }, include: { site: { select: { siteName: true } } } });
  if (!item) throw ApiError.notFound('News item not found');
  return item;
}

async function createNews({ title, summary, body, imageUrl, featured, publishAt, siteKey }) {
  const siteId = siteKey ? await resolveSiteId(siteKey) : null;
  return prisma.news.create({
    data: {
      title,
      summary,
      body,
      imageUrl,
      featured: !!featured,
      publishAt: publishAt ? new Date(publishAt) : null,
      siteId,
      status: 'DRAFT',
    },
  });
}

async function updateNews(id, { title, summary, body, imageUrl, featured, publishAt, siteKey }) {
  const siteId = siteKey !== undefined ? (siteKey ? await resolveSiteId(siteKey) : null) : undefined;
  try {
    return await prisma.news.update({
      where: { id },
      data: {
        title,
        summary,
        body,
        imageUrl,
        featured,
        publishAt: publishAt !== undefined ? (publishAt ? new Date(publishAt) : null) : undefined,
        siteId,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('News item not found');
    throw err;
  }
}

async function setNewsStatus(id, status, actorId) {
  try {
    const item = await prisma.news.update({ where: { id }, data: { status } });
    await logAction({ action: `News item status changed to ${status}`, target: item.title, actorId });
    return item;
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('News item not found');
    throw err;
  }
}

async function removeNews(id, actorId) {
  try {
    const item = await prisma.news.delete({ where: { id } });
    await logAction({ action: 'News item removed', target: item.title, actorId });
    return item;
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('News item not found');
    throw err;
  }
}

// Public: Shared AppCentre + the requesting site's own news, featured first.
// A scheduled item counts as visible once its publishAt has passed - no cron
// needed to flip the status, the read path just checks the timestamp too.
async function listPublicNews({ siteKey, limit = 6 }) {
  const siteId = siteKey ? await resolveSiteId(siteKey) : null;
  const now = new Date();
  return prisma.news.findMany({
    where: {
      AND: [
        { OR: siteId ? [{ siteId: null }, { siteId }] : [{ siteId: null }] },
        { OR: [{ status: 'PUBLISHED' }, { status: 'SCHEDULED', publishAt: { lte: now } }] },
      ],
    },
    orderBy: [{ featured: 'desc' }, { publishAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

module.exports = { listNews, getNewsById, createNews, updateNews, setNewsStatus, removeNews, listPublicNews };
