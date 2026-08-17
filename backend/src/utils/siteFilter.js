const { SITE_SOURCES } = require('../constants/siteSources');

// Accepts either the real Site.siteKey slug ("aitransformation") or its
// human-readable source name ("AI Transformation") and resolves both
// consistently. Shared by every service that needs to filter records tagged
// with the legacy siteId-null + source pattern (Enquiries, Reviews,
// Dashboard) - single source of truth instead of three copies of the same
// resolution logic.
function resolveSiteFilter(siteKey) {
  const normalized = siteKey.trim();
  const bySlug = SITE_SOURCES[normalized.toLowerCase()];
  if (bySlug) return { slug: normalized.toLowerCase(), legacySource: bySlug };

  const bySourceName = Object.entries(SITE_SOURCES).find(
    ([, name]) => name.toLowerCase() === normalized.toLowerCase()
  );
  if (bySourceName) return { slug: bySourceName[0], legacySource: bySourceName[1] };

  return { slug: normalized, legacySource: normalized };
}

module.exports = { resolveSiteFilter };
