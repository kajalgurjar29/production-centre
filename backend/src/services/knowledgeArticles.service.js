const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { resolveSiteId } = require('../utils/resolveSiteId');

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'INACTIVE'];
const SITE_SELECT = { site: { select: { id: true, siteKey: true, siteName: true } } };

// undefined siteKey (field omitted) -> undefined siteId, so Prisma leaves the
// column untouched on update / defaults to null on create. null or '' siteKey
// -> siteId: null, explicitly clearing the article to Shared AppCentre.
async function resolveSiteIdField(siteKey) {
  if (siteKey === undefined) return undefined;
  return siteKey ? resolveSiteId(siteKey) : null;
}

async function listArticles({ status, category, search, siteKey }) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest(`status must be one of ${VALID_STATUSES.join(', ')}`);
  }

  const conditions = [];
  if (status) conditions.push({ status });
  if (category) conditions.push({ category });
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } },
      ],
    });
  }
  // With a siteKey given, scope to that site's own articles plus Shared
  // (siteId null). Without one, the admin list shows everything.
  if (siteKey) {
    const siteId = await resolveSiteId(siteKey);
    conditions.push({ OR: [{ siteId: null }, { siteId }] });
  }

  const where = conditions.length ? { AND: conditions } : {};

  return prisma.knowledgeArticle.findMany({ where, orderBy: { updatedAt: 'desc' }, include: SITE_SELECT });
}

async function getArticleById(id) {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id }, include: SITE_SELECT });
  if (!article) throw ApiError.notFound('Article not found');
  return article;
}

async function createArticle({ title, category, answer, keywords, updatedBy, sourceQuestionId, siteKey }) {
  const siteId = await resolveSiteIdField(siteKey);
  const article = await prisma.knowledgeArticle.create({
    data: { title, category, answer, keywords, status: 'DRAFT', updatedBy, siteId },
    include: SITE_SELECT,
  });

  if (sourceQuestionId) {
    await prisma.unansweredQuestion
      .update({ where: { id: sourceQuestionId }, data: { articleId: article.id } })
      .catch(() => {});
  }

  return article;
}

async function updateArticle(id, { title, category, answer, keywords, updatedBy, siteKey }) {
  const siteId = await resolveSiteIdField(siteKey);
  try {
    return await prisma.knowledgeArticle.update({
      where: { id },
      data: { title, category, answer, keywords, updatedBy, siteId },
      include: SITE_SELECT,
    });
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('Article not found');
    throw err;
  }
}

async function setArticleStatus(id, status, { updatedBy, sourceQuestionId } = {}) {
  let article;
  try {
    article = await prisma.knowledgeArticle.update({
      where: { id },
      data: { status, updatedBy },
    });
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('Article not found');
    throw err;
  }

  if (status === 'PUBLISHED') {
    // The article<->question link is written at creation time (the question's
    // articleId), so publishing resolves it via that stored relation - the
    // caller doesn't need to resend sourceQuestionId on every later publish
    // call (e.g. publishing a draft in a separate session from the one that
    // created it). sourceQuestionId is still honored directly in case the
    // caller links a question to an already-existing article in this call.
    if (sourceQuestionId) {
      await prisma.unansweredQuestion
        .update({ where: { id: sourceQuestionId }, data: { status: 'RESOLVED', articleId: article.id } })
        .catch(() => {});
    }
    await prisma.unansweredQuestion.updateMany({
      where: { articleId: article.id, status: { not: 'RESOLVED' } },
      data: { status: 'RESOLVED' },
    });
  }

  return article;
}

module.exports = { listArticles, getArticleById, createArticle, updateArticle, setArticleStatus };
