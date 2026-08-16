const prisma = require('../config/prisma');

// Single place every mutating action writes its audit trail through, so the
// call shape (action/target/reason/actorId) stays consistent across services.
async function logAction({ action, target, reason, actorId }) {
  await prisma.auditLog.create({ data: { action, target, reason, actorId } });
}

module.exports = { logAction };
