const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listUsers({ search, status, page = 1, pageSize = 20 }) {
  const where = {
    AND: [
      status ? { status } : {},
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { adverts: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: items.map((u) => ({ ...u, advertsCount: u._count.adverts, _count: undefined })),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { adverts: true } });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict('A user with this email already exists');
  return prisma.user.create({ data });
}

async function updateUser(id, data) {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data });
}

async function setUserStatus(id, status) {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { status } });
}

module.exports = { listUsers, getUserById, createUser, updateUser, setUserStatus };
