const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');

async function listAdvertTypes() {
  return prisma.advertType.findMany({ orderBy: { createdAt: 'asc' } });
}

async function getAdvertTypeById(id) {
  const type = await prisma.advertType.findUnique({ where: { id } });
  if (!type) throw ApiError.notFound('Advert type not found');
  return type;
}

async function createAdvertType({ name, price, durationDays, placement, enabled }, actorId) {
  const type = await prisma.advertType.create({
    data: { name, price, durationDays, placement, enabled: enabled ?? true },
  });
  await logAction({ action: 'Advert type created', target: type.name, actorId });
  return type;
}

async function updateAdvertType(id, { name, price, durationDays, placement, enabled }, actorId) {
  await getAdvertTypeById(id);
  const type = await prisma.advertType.update({
    where: { id },
    data: { name, price, durationDays, placement, enabled },
  });
  await logAction({ action: 'Advert type updated', target: type.name, actorId });
  return type;
}

module.exports = { listAdvertTypes, getAdvertTypeById, createAdvertType, updateAdvertType };
