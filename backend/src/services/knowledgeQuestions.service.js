const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['NEW', 'REVIEWED', 'RESOLVED'];

async function listQuestions({ status, search, siteKey }) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest(`status must be one of ${VALID_STATUSES.join(', ')}`);
  }

  const where = {};
  if (status) where.status = status;
  if (search) where.question = { contains: search, mode: 'insensitive' };
  // Unlike articles, questions always belong to exactly one originating
  // site (no "Shared" concept) - a strict relation match is correct here.
  if (siteKey) where.site = { siteKey };

  return prisma.unansweredQuestion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { site: { select: { siteKey: true, siteName: true } } },
  });
}

async function reviewQuestion(id) {
  try {
    return await prisma.unansweredQuestion.update({ where: { id }, data: { status: 'REVIEWED' } });
  } catch (err) {
    if (err.code === 'P2025') throw ApiError.notFound('Question not found');
    throw err;
  }
}

module.exports = { listQuestions, reviewQuestion };
