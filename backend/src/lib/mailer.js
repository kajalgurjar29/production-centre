const nodemailer = require('nodemailer');
const { mail, nodeEnv } = require('../config/env');
const ApiError = require('../utils/ApiError');

const isConfigured = Boolean(mail.host);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
    })
  : null;

// Sends an email, or logs it to the console when SMTP isn't configured (dev
// fallback) - outside production only. In production an unconfigured mailer
// is a real misconfiguration, so it throws instead of silently dropping mail.
async function sendMail({ to, subject, html, text, replyTo }) {
  if (!isConfigured) {
    if (nodeEnv === 'production') {
      throw ApiError.badRequest('Mail is not configured (SMTP_HOST is unset)');
    }
    console.log(`[mailer] SMTP not configured - logging email instead of sending.\n  To: ${to}\n  Reply-To: ${replyTo || '(none)'}\n  Subject: ${subject}\n  ${text || html}`);
    return { logged: true };
  }

  return transporter.sendMail({ from: mail.from, to, subject, html, text, replyTo });
}

module.exports = { sendMail };
