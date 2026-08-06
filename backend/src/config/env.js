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
  allowedOrigins,
  // Optional: the Help Assistant chat endpoint degrades to a 500 (not a boot
  // crash) when this is unset, so a missing/rotated OpenAI key never takes
  // down the rest of the admin API with it.
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};
