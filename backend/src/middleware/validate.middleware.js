const ApiError = require('../utils/ApiError');

// Validates req.body against a zod schema, replacing it with the parsed
// (and type-coerced) result so controllers can trust their input.
function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors));
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
