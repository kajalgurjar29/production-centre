const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { resolveSiteId } = require('../utils/resolveSiteId');

const BLOCK_KEYS = ['HERO', 'FEATURED', 'TESTIMONIALS', 'CTA'];

// Idempotent - creates any missing block rows for the site so the admin list
// always shows exactly one row per block key, even for a brand-new site.
async function ensureBlocksForSite(siteId) {
  await Promise.all(
    BLOCK_KEYS.map((key) =>
      prisma.homepageBlock.upsert({
        where: { siteId_key: { siteId, key } },
        update: {},
        create: { siteId, key, published: true },
      })
    )
  );
}

async function listBlocks(siteKey) {
  const siteId = await resolveSiteId(siteKey);
  if (!siteId) throw ApiError.notFound(`Unknown site "${siteKey}"`);
  await ensureBlocksForSite(siteId);
  return prisma.homepageBlock.findMany({ where: { siteId }, orderBy: { key: 'asc' } });
}

async function updateBlock(siteKey, key, data, actorId) {
  const siteId = await resolveSiteId(siteKey);
  if (!siteId) throw ApiError.notFound(`Unknown site "${siteKey}"`);
  if (!BLOCK_KEYS.includes(key)) throw ApiError.badRequest(`Unknown block "${key}"`);

  const block = await prisma.homepageBlock.upsert({
    where: { siteId_key: { siteId, key } },
    update: { ...data, updatedBy: actorId },
    create: { siteId, key, ...data, updatedBy: actorId },
  });
  await logAction({ action: `Homepage block ${key} updated`, target: siteKey, actorId });
  return block;
}

// Public: every published block for a site, keyed for easy lookup by the
// homepage. A missing/unpublished block simply isn't in the response, so the
// page falls back to its own default copy.
async function getPublicBlocks(siteKey) {
  const siteId = await resolveSiteId(siteKey);
  if (!siteId) return [];
  return prisma.homepageBlock.findMany({ where: { siteId, published: true } });
}

module.exports = { listBlocks, updateBlock, getPublicBlocks };
