const prisma = require('../config/prisma');

// Single place every mutating action writes its audit trail through, so the
// call shape (action/target/reason/actorId) stays consistent across services.
// Best-effort: the STATIC_ADMIN dev-bypass login (see auth.service.js) has no
// AdminUser row, so actorId's foreign key rejects it there. A failure here
// must never block the mutation it's recording, so it's logged and swallowed
// rather than thrown.
async function logAction({ action, target, reason, actorId }) {
  try {
    await prisma.auditLog.create({ data: { action, target, reason, actorId } });
  } catch (err) {
    console.error(`[auditLog] Failed to record "${action}": ${err.message}`);
  }
}

module.exports = { logAction };
