// Registry of known enquiry sources, keyed by the URL slug used in
// POST /api/enquiries/:source. Add a new site here when it needs its own
// contact-form endpoint - this is what prevents inconsistent/typo'd source
// values accumulating in the database.
const ENQUIRY_SOURCES = {
  aitransformation: 'AI Transformation',
};

module.exports = { ENQUIRY_SOURCES };
