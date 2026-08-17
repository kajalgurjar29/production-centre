const prisma = require('../config/prisma');
const { resolveSiteId } = require('../utils/resolveSiteId');
const { resolveSiteFilter } = require('../utils/siteFilter');

const PERIOD_DAYS = { today: 1, '7d': 7, '30d': 30 };
const OVERDUE_ENQUIRY_DAYS = 3;

function periodStart(period) {
  const days = PERIOD_DAYS[period] || 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
}

// Users have no Site relation at all in the schema (registration is
// platform-wide, not per-site), so "Registered Users" is intentionally left
// global regardless of the selected site - there's no data to scope it by.
// Adverts and Payments carry siteId directly. Enquiries and Reviews use the
// same site-relation + legacy-source fallback as their own list endpoints,
// so the dashboard counts match what those pages actually show.
async function getSummary(period, siteKey) {
  const since = periodStart(period);
  const overdueBefore = new Date(Date.now() - OVERDUE_ENQUIRY_DAYS * 24 * 60 * 60 * 1000);

  const siteId = siteKey ? await resolveSiteId(siteKey) : undefined;
  const advertSiteWhere = siteId !== undefined ? { siteId } : {};
  // Payment has no siteId of its own - it only reaches a site through its Advert.
  const paymentSiteWhere = siteId !== undefined ? { advert: { siteId } } : {};

  let enquirySiteWhere = {};
  let reviewSiteWhere = {};
  if (siteKey) {
    const resolved = resolveSiteFilter(siteKey);
    const siteOr = { OR: [{ site: { siteKey: resolved.slug } }, { siteId: null, source: resolved.legacySource }] };
    enquirySiteWhere = siteOr;
    reviewSiteWhere = siteOr;
  }

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
    prisma.advert.count({ where: { status: 'ACTIVE', ...advertSiteWhere } }),
    prisma.advert.count({ where: { status: 'PENDING_REVIEW', ...advertSiteWhere } }),
    prisma.advert.findFirst({ where: { status: 'PENDING_REVIEW', ...advertSiteWhere }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    prisma.payment.count({ where: { status: 'PAID', createdAt: { gte: since }, ...paymentSiteWhere } }),
    prisma.payment.count({ where: { status: 'FAILED', ...paymentSiteWhere } }),
    prisma.contactEnquiry.count({ where: { AND: [{ status: { in: ['NEW', 'IN_PROGRESS'] } }, enquirySiteWhere] } }),
    prisma.contactEnquiry.count({ where: { AND: [{ status: { in: ['NEW', 'IN_PROGRESS'] }, createdAt: { lt: overdueBefore } }, enquirySiteWhere] } }),
    prisma.review.count({ where: { AND: [{ status: 'PENDING' }, reviewSiteWhere] } }),
    prisma.review.count({ where: { AND: [{ reportCount: { gt: 0 } }, reviewSiteWhere] } }),
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
