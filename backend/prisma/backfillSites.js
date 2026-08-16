// One-off, idempotent backfill: creates the Site row(s) for currently-known
// sites and populates siteId on existing rows that predate the Site model.
// Not wired into `prisma.seed` in package.json, so `prisma migrate reset`
// never re-runs it by accident - run explicitly via `npm run backfill:sites`.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// AITransformation is the only live site today. supportEmail is a
// placeholder until a real mailbox is configured - update it via Prisma
// Studio (`npm run prisma:studio`) or a future Site Configuration admin page.
const KNOWN_SOURCE_NAME = 'AI Transformation';
const SITE_SEED = {
  siteKey: 'aitransformation',
  siteName: 'AI Transformation',
  supportEmail: process.env.AITRANSFORMATION_SUPPORT_EMAIL || 'support@aitransformationprofessionals.com',
};

async function main() {
  const site = await prisma.site.upsert({
    where: { siteKey: SITE_SEED.siteKey },
    update: {},
    create: SITE_SEED,
  });
  console.log(`Site ready: ${site.siteKey} (${site.id})`);

  // ContactEnquiry / Review: only backfill rows whose source is either unset
  // or already known to belong to this site - anything else is flagged for
  // manual review rather than guessed at.
  const enquiryBackfill = await prisma.contactEnquiry.updateMany({
    where: { siteId: null, OR: [{ source: null }, { source: KNOWN_SOURCE_NAME }] },
    data: { siteId: site.id },
  });
  const enquiryUnmapped = await prisma.contactEnquiry.count({
    where: { siteId: null, NOT: { OR: [{ source: null }, { source: KNOWN_SOURCE_NAME }] } },
  });
  console.log(`ContactEnquiry: backfilled ${enquiryBackfill.count}, unmapped ${enquiryUnmapped}`);

  // Unlike ContactEnquiry.source, Review.source is non-nullable (defaults to
  // "AI Transformation") - so there's no null case to match here.
  const reviewBackfill = await prisma.review.updateMany({
    where: { siteId: null, source: KNOWN_SOURCE_NAME },
    data: { siteId: site.id },
  });
  const reviewUnmapped = await prisma.review.count({
    where: { siteId: null, NOT: { source: KNOWN_SOURCE_NAME } },
  });
  console.log(`Review: backfilled ${reviewBackfill.count}, unmapped ${reviewUnmapped}`);

  // No per-site source concept on these tables yet - every existing row
  // belongs to the one live site.
  const articleBackfill = await prisma.knowledgeArticle.updateMany({ where: { siteId: null }, data: { siteId: site.id } });
  console.log(`KnowledgeArticle: backfilled ${articleBackfill.count}`);

  const questionBackfill = await prisma.unansweredQuestion.updateMany({ where: { siteId: null }, data: { siteId: site.id } });
  console.log(`UnansweredQuestion: backfilled ${questionBackfill.count}`);

  const advertBackfill = await prisma.advert.updateMany({ where: { siteId: null }, data: { siteId: site.id } });
  console.log(`Advert: backfilled ${advertBackfill.count}`);

  if (enquiryUnmapped > 0 || reviewUnmapped > 0) {
    console.warn('Some ContactEnquiry/Review rows have a `source` value that did not match a known site and were left with siteId=null. Review these manually.');
  }

  console.log('Backfill complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
