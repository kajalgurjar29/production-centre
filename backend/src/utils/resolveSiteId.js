const prisma = require('../config/prisma');

// Best-effort siteKey -> Site.id lookup. Never throws - public submission
// endpoints (enquiries, reviews) must keep working even in an environment
// where the Site backfill hasn't run yet, so a miss just means siteId stays
// null on the created row rather than failing the whole request.
async function resolveSiteId(siteKey) {
  if (!siteKey) return null;
  const site = await prisma.site.findUnique({ where: { siteKey }, select: { id: true } });
  return site ? site.id : null;
}

module.exports = { resolveSiteId };
