const prisma = require('../config/prisma');

const PERIOD_DAYS = { today: 1, '7d': 7, '30d': 30 };
const OVERDUE_ENQUIRY_DAYS = 3;

function periodStart(period) {
  const days = PERIOD_DAYS[period] || 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
}

async function getSummary(period) {
  const since = periodStart(period);
  const overdueBefore = new Date(Date.now() - OVERDUE_ENQUIRY_DAYS * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    activeAdverts,
    pendingReviewAdverts,
    oldestPendingReview,
    successfulPaymentsInPeriod,
    failedPayments,
    openEnquiries,
    overdueEnquiries,
    pendingReviews,
    reportedReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.advert.count({ where: { status: 'ACTIVE' } }),
    prisma.advert.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.advert.findFirst({ where: { status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    prisma.payment.count({ where: { status: 'PAID', createdAt: { gte: since } } }),
    prisma.payment.count({ where: { status: 'FAILED' } }),
    prisma.contactEnquiry.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
    prisma.contactEnquiry.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] }, createdAt: { lt: overdueBefore } } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { reportCount: { gt: 0 } } }),
  ]);

  const oldestPendingReviewDays = oldestPendingReview
    ? Math.floor((Date.now() - new Date(oldestPendingReview.createdAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    period: period || '30d',
    users: { total: totalUsers, newInPeriod: newUsers },
    adverts: { active: activeAdverts, pendingReview: pendingReviewAdverts, oldestPendingReviewDays },
    payments: { successfulInPeriod: successfulPaymentsInPeriod, failed: failedPayments },
    enquiries: { open: openEnquiries, overdue: overdueEnquiries },
    reviews: { pending: pendingReviews, reported: reportedReviews },
  };
}

module.exports = { getSummary };
