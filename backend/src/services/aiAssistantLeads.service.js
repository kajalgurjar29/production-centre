const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { resolveSiteId } = require('../utils/resolveSiteId');
const { resolveSiteFilter } = require('../utils/siteFilter');

async function listLeads({ status, siteKey, page = 1, pageSize = 20 }) {
  const conditions = [];
  if (status) conditions.push({ status });
  if (siteKey) {
    const resolved = resolveSiteFilter(siteKey);
    conditions.push({ site: { siteKey: resolved.slug } });
  }
  const where = conditions.length ? { AND: conditions } : {};

  const [items, total] = await Promise.all([
    prisma.aiAssistantLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { site: { select: { siteKey: true, siteName: true } } },
    }),
    prisma.aiAssistantLead.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function setLeadStatus(id, status, actorId) {
  const lead = await prisma.aiAssistantLead.findUnique({ where: { id } });
  if (!lead) throw ApiError.notFound('Lead not found');
  const updated = await prisma.aiAssistantLead.update({ where: { id }, data: { status } });
  await logAction({ action: `AI Assistant lead status changed to ${status}`, target: `LEAD-${lead.sequenceNumber} (${[lead.firstName, lead.lastName].filter(Boolean).join(' ')})`, actorId });
  return updated;
}

// Public, unauthenticated write (called from the pre-chat form) - a
// best-effort siteId resolution, same as the chat endpoint's own siteKey
// handling, since capturing the lead matters more than a strict site match.
async function createLead({ firstName, email, sessionId, siteKey }) {
  const siteId = siteKey ? await resolveSiteId(siteKey) : null;
  return prisma.aiAssistantLead.create({
    data: { firstName, lastName: '', email, sessionId, siteId },
  });
}

module.exports = { listLeads, setLeadStatus, createLead };
