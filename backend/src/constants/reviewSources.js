// Registry of known review sources, keyed by the URL slug used in
// POST /api/reviews/:source. Add a new site here when it needs its own
// review-submission endpoint - this is what prevents inconsistent/typo'd
// source values accumulating in the database.
const REVIEW_SOURCES = {
  aitransformation: 'AI Transformation',
};

module.exports = { REVIEW_SOURCES };
