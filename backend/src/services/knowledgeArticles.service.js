const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'INACTIVE'];

async function listArticles({ status, category, search }) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest(`status must be one of ${VALID_STATUSES.join(', ')}`);
  }

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { keywords: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.knowledgeArticle.findMany({ where, orderBy: { updatedAt: 'desc' } });
}

async function getArticleById(id) {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!article) throw ApiError.notFound('Article not found');
  return article;
}

async function createArticle({ title, category, answer, keywords, updatedBy, sourceQuestionId }) {
  const article = await prisma.knowledgeArticle.create({
    data: { title, category, answer, keywords, status: 'DRAFT', updatedBy },
  });

  if (sourceQuestionId) {
    await prisma.unansweredQuestion
      .update({ where: { id: sourceQuestionId }, data: { articleId: article.id } })
      .catch(() => {});
  }

  return article;
}

async function updateArticle(id, { title, category, answer, keywords, updatedBy }) {
  try {
    return await prisma.knowledgeArticle.update({
      where: { id },
      data: { title, category, answer, keywords, updatedBy },
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

  if (status === 'PUBLISHED' && sourceQuestionId) {
    await prisma.unansweredQuestion
      .update({ where: { id: sourceQuestionId }, data: { status: 'RESOLVED', articleId: article.id } })
      .catch(() => {});
  }

  return article;
}

module.exports = { listArticles, getArticleById, createArticle, updateArticle, setArticleStatus };
