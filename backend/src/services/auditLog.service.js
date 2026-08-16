const prisma = require('../config/prisma');

async function listAuditLog({ actor, action, page = 1, pageSize = 20 }) {
  const where = {
    AND: [
      action ? { action: { contains: action, mode: 'insensitive' } } : {},
      actor
        ? { actor: { is: { OR: [{ name: { contains: actor, mode: 'insensitive' } }, { email: { contains: actor, mode: 'insensitive' } }] } } }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

module.exports = { listAuditLog };
