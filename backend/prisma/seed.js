const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { ensureKnowledgeBaseSeeded } = require('../src/lib/knowledgeBaseSeed');

const prisma = new PrismaClient();

async function main() {
  const users = await Promise.all(
    [
      { name: 'Daniel Moore', email: 'daniel.moore@appcentre.local', status: 'ACTIVE' },
      { name: 'Priya Nair', email: 'priya.nair@appcentre.local', status: 'ACTIVE' },
      { name: 'Callum Reid', email: 'callum.reid@appcentre.local', status: 'SUSPENDED' },
      { name: 'Sarah Collins', email: 'sarah.collins@appcentre.local', status: 'ACTIVE' },
    ].map((u) => prisma.user.upsert({ where: { email: u.email }, update: {}, create: u }))
  );

  const gardenStudio = await prisma.advert.upsert({
    where: { reference: 'AC-2048' },
    update: {},
    create: {
      reference: 'AC-2048',
      title: 'Garden Studio',
      description: 'Premium local garden studio installation advert with a clear call to action.',
      type: 'Banner',
      placement: 'Homepage banner',
      status: 'PENDING_REVIEW',
      paymentStatus: 'PAID',
      sponsored: true,
      country: 'United Kingdom',
      region: 'Greater Manchester',
      city: 'Manchester',
      startDate: new Date('2026-07-14'),
      endDate: new Date('2026-10-14'),
      advertiserId: users[0].id,
    },
  });

  await prisma.advert.upsert({
    where: { reference: 'AC-2036' },
    update: {},
    create: {
      reference: 'AC-2036',
      title: 'Local Plumbing Services',
      type: 'Side Card',
      placement: 'Category listing',
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      country: 'United Kingdom',
      city: 'Manchester',
      startDate: new Date('2026-07-04'),
      endDate: new Date('2026-10-12'),
      views: 2450,
      clicks: 184,
      advertiserId: users[3].id,
    },
  });

  await prisma.payment.upsert({
    where: { transactionRef: 'PAY-2048-7781' },
    update: {},
    create: {
      transactionRef: 'PAY-2048-7781',
      amount: 180.0,
      currency: 'GBP',
      provider: 'Stripe',
      status: 'PAID',
      paidAt: new Date('2026-07-10T09:05:00Z'),
      advertId: gardenStudio.id,
    },
  });

  await prisma.review.createMany({
    data: [
      { name: 'Amina Bello', rating: 5, topic: 'Gratitude', details: 'It was easy to understand how to register and manage my advert.', country: 'Nigeria', city: 'Lagos', status: 'APPROVED' },
      { name: 'James Carter', rating: 5, topic: 'Endorsement', details: 'The service cards are clear and easy to use.', country: 'United Kingdom', city: 'London', status: 'APPROVED' },
      { name: 'Daniel Okoro', rating: 2, topic: 'Concerns', details: 'Payment confirmation took longer than expected.', country: 'Nigeria', city: 'Abuja', status: 'APPROVED', reportCount: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.contactEnquiry.createMany({
    data: [
      { name: 'Priya Nair', email: 'priya.nair@appcentre.local', subject: 'Question about advert pricing', message: 'Could you clarify the banner advert pricing tiers?', status: 'NEW' },
      { name: 'Callum Reid', email: 'callum.reid@appcentre.local', subject: 'Unable to upload advert image', message: 'The image upload keeps failing on my account.', status: 'IN_PROGRESS' },
    ],
    skipDuplicates: true,
  });

  await ensureKnowledgeBaseSeeded(prisma);

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
