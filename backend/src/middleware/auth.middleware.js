const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { jwtSecret } = require('../config/env');

// Verifies the Bearer token and attaches { id, role } to req.admin.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.admin = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// Usage: requireRole('ADMINISTRATOR', 'MODERATOR')
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.admin) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.admin.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
