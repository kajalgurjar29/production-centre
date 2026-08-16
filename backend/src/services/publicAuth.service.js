const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { sendMail } = require('../lib/mailer');
const { generateOtpCode, hashOtp, verifyOtpHash } = require('../utils/otp');
const { jwtSecret, publicJwtExpiresIn, otpExpiryMinutes } = require('../config/env');

const GENERIC_OTP_ERROR = 'Invalid or expired code';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function issueOtp(user) {
  const code = generateOtpCode();
  const otpCodeHash = await hashOtp(code);
  const otpExpiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

  await prisma.user.update({ where: { id: user.id }, data: { otpCodeHash, otpExpiresAt } });

  await sendMail({
    to: user.email,
    subject: 'Your AppCentre verification code',
    text: `Your verification code is ${code}. It expires in ${otpExpiryMinutes} minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${otpExpiryMinutes} minutes.</p>`,
  });
}

// Creates the account (or resumes an incomplete one - e.g. a prior
// register() call whose OTP was never verified) and emails a fresh code.
async function register({ title, firstName, surname, email, sex }) {
  const normalizedEmail = normalizeEmail(email);
  const name = `${firstName} ${surname}`.trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing && existing.otpVerifiedAt) {
    throw ApiError.conflict('An account with this email already exists. Please log in instead.');
  }

  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { title, firstName, surname, sex, name } })
    : await prisma.user.create({ data: { title, firstName, surname, sex, name, email: normalizedEmail } });

  await issueOtp(user);
  return { email: user.email };
}

// Login step 1. Always returns the same shape whether or not the account
// exists, so this endpoint can't be used to enumerate registered emails.
async function requestOtp(email) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (user) {
    await issueOtp(user);
  }
  return { email: normalizedEmail };
}

async function verifyOtp(email, code) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw ApiError.unauthorized(GENERIC_OTP_ERROR);
  }

  const matches = await verifyOtpHash(code, user.otpCodeHash);
  if (!matches) {
    throw ApiError.unauthorized(GENERIC_OTP_ERROR);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { otpCodeHash: null, otpExpiresAt: null, otpVerifiedAt: new Date() },
  });

  const token = jwt.sign({ sub: updated.id, aud: 'public-user' }, jwtSecret, { expiresIn: publicJwtExpiresIn });

  return {
    token,
    profileComplete: updated.profileComplete,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      title: updated.title,
      firstName: updated.firstName,
      surname: updated.surname,
    },
  };
}

module.exports = { register, requestOtp, verifyOtp };
