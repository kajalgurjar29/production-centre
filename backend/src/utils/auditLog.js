const prisma = require('../config/prisma');

// Single place every mutating action writes its audit trail through, so the
// call shape (action/target/reason/actorId) stays consistent across services.
// The STATIC_ADMIN dev-bypass login (see auth.service.js) has no AdminUser
// row, so actorId's foreign key rejects it there - rather than silently
// dropping the entire entry (which used to happen and made the audit trail
// go blank for every bypass-login action), retry once recording it with no
// actor attached so the action is still visible (shown as "System" in the
// UI). A failure here must never block the mutation it's recording.
async function logAction({ action, target, reason, actorId }) {
  try {
    await prisma.auditLog.create({ data: { action, target, reason, actorId } });
  } catch (err) {
    if (err.code === 'P2003' && actorId) {
      try {
        await prisma.auditLog.create({ data: { action, target, reason, actorId: null } });
        return;
      } catch (retryErr) {
        console.error(`[auditLog] Failed to record "${action}" even without actor: ${retryErr.message}`);
        return;
      }
    }
    console.error(`[auditLog] Failed to record "${action}": ${err.message}`);
  }
}

module.exports = { logAction };
