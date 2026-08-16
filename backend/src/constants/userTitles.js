// Registry of the fixed Title values a public user can register with, keyed
// by the Prisma UserTitle enum value. Alphabetic by label, matching the
// AppCentre design spec's required dropdown order.
const USER_TITLES = {
  ALHAJA: 'Alhaja',
  ALHAJI: 'Alhaji',
  CHIEF: 'Chief',
  DR: 'Dr',
  ENGR: 'Engr',
  LADY: 'Lady',
  MALAM: 'Malam',
  MISS: 'Miss',
  MR: 'Mr',
  MRS: 'Mrs',
  MS: 'Ms',
  PROF: 'Prof',
  PST: 'Pst',
  REV: 'Rev',
  SIR: 'Sir',
};

module.exports = { USER_TITLES };
