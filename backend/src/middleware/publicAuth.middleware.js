const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { jwtSecret } = require('../config/env');

// Mirror of requireAuth (admin.middleware.js) for the public-user token
// audience. Not consumed by any route yet in this phase - scaffolding for
// the profile/dashboard endpoints that build on top of public auth next.
function requirePublicUser(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.aud !== 'public-user') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

module.exports = { requirePublicUser };
