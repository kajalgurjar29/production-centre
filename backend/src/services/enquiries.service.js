const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listEnquiries({ status, source, page = 1, pageSize = 20 }) {
  const where = {
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.contactEnquiry.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function setEnquiryStatus(id, status) {
  const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } });
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return prisma.contactEnquiry.update({ where: { id }, data: { status } });
}

async function createEnquiry({ title, firstName, lastName, name, email, country, city, enquiryType, subject, message, source }) {
  const resolvedName = name || [title, firstName, lastName].filter(Boolean).join(' ');
  const resolvedSubject = subject || enquiryType;

  return prisma.contactEnquiry.create({
    data: {
      title,
      firstName,
      lastName,
      name: resolvedName,
      email,
      country,
      city,
      enquiryType,
      subject: resolvedSubject,
      message,
      source,
    },
  });
}

module.exports = { listEnquiries, setEnquiryStatus, createEnquiry };
