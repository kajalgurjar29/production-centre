// Registry of known site sources, keyed by the URL slug used in
// POST /api/enquiries/:source and POST /api/reviews/:source (e.g.
// "aitransformation"). Shared by both features since the slug is always the
// Site.siteKey - this is what prevents inconsistent/typo'd source values
// accumulating in the database. Add a new site here when it needs its own
// contact-form or review-submission endpoint.
const SITE_SOURCES = {
  aitransformation: 'AI Transformation',
};

module.exports = { SITE_SOURCES };
