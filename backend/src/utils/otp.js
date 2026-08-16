const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// 6-digit code, zero-padded so it's always exactly 6 characters.
function generateOtpCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

function verifyOtpHash(code, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(code, hash);
}

module.exports = { generateOtpCode, hashOtp, verifyOtpHash };
