require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '*';
const allowedOrigins = allowedOriginsRaw === '*'
  ? '*'
  : allowedOriginsRaw.split(',').map((origin) => origin.trim()).filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // Public-user (non-admin) token audience - separate expiry since it's a
  // much longer-lived session than an admin login.
  publicJwtExpiresIn: process.env.PUBLIC_JWT_EXPIRES_IN || '30d',
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
  allowedOrigins,
  // Optional: the Help Assistant chat endpoint degrades to a 500 (not a boot
  // crash) when this is unset, so a missing/rotated OpenAI key never takes
  // down the rest of the admin API with it.
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // Optional: mailer.js falls back to logging emails to the console when
  // SMTP_HOST is unset (outside production) instead of throwing.
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'AppCentre <no-reply@appcentre.local>',
  },
};
