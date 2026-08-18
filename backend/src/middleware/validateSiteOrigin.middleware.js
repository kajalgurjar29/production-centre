const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { nodeEnv } = require('../config/env');

function hostFromHeader(value) {
  if (!value) return null;
  try {
    // Origin is just a scheme+host; Referer is a full URL - the URL parser
    // handles both since Origin also parses fine as a URL.
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch (err) {
    return null;
  }
}

// Public per-site submission endpoints (POST /api/enquiries/:source) must not
// trust the :source slug on its own (spec §9) - this checks the Site is
// active and, when an approvedDomain is configured, that the request actually
// came from that domain. Skipped outside production so local dev/curl/Postman
// testing without an Origin header keeps working; an unknown source is left
// for the controller to 404 on rather than duplicating that check here.
const validateSiteOrigin = asyncHandler(async (req, res, next) => {
  if (nodeEnv !== 'production') return next();

  const slug = req.params.source ? req.params.source.toLowerCase() : null;
  const site = slug ? await prisma.site.findUnique({ where: { siteKey: slug } }) : null;
  if (!site) return next();

  if (!site.active) {
    return next(ApiError.forbidden('This site is not currently active'));
  }

  if (site.approvedDomain) {
    const approvedHost = site.approvedDomain.toLowerCase().replace(/^www\./, '');
    const requestHost = hostFromHeader(req.headers.origin) || hostFromHeader(req.headers.referer);
    if (!requestHost || requestHost !== approvedHost) {
      return next(ApiError.forbidden('Request origin is not approved for this site'));
    }
  } else {
    console.warn(`[validateSiteOrigin] Site "${site.siteKey}" has no approvedDomain configured - skipping origin check.`);
  }

  next();
});

module.exports = { validateSiteOrigin };
