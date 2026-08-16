const { requireRole } = require('../middleware/auth.middleware');

// Single source of truth for "which of the 6 fixed admin roles can perform
// this action" - routes import requirePermission(key) instead of calling
// requireRole(...) with an inline role list, so the matrix stays in one
// place instead of drifting across route files. READONLY_AUDITOR is
// deliberately absent from every write permission below - it should never
// gain write access just because a new action is added here.
const PERMISSIONS = {
  USERS_WRITE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'],
  USERS_SUSPEND: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'],
  USERS_REINSTATE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'],

  ADVERTS_UPDATE_STATUS: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN'],

  REVIEWS_UPDATE_STATUS: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'CONTENT_ADMIN'],

  ENQUIRIES_UPDATE_STATUS: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'],

  KNOWLEDGE_ARTICLES_WRITE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN'],
  KNOWLEDGE_QUESTIONS_REVIEW: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN', 'MODERATOR'],

  NOTIFICATIONS_WRITE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN'],

  NEWS_WRITE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN'],
  HOMEPAGE_CONTENT_WRITE: ['SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN'],

  AUDIT_LOG_READ: ['SUPER_ADMIN', 'ADMINISTRATOR', 'READONLY_AUDITOR'],
};

function requirePermission(key) {
  const allowedRoles = PERMISSIONS[key];
  if (!allowedRoles) {
    throw new Error(`Unknown permission key: ${key}`);
  }
  return requireRole(...allowedRoles);
}

module.exports = { PERMISSIONS, requirePermission };
