const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/auditLog');
const { sendMail } = require('../lib/mailer');
const { resolveSiteFilter } = require('../utils/siteFilter');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function listEnquiries({ status, source, siteKey, page = 1, pageSize = 20 }) {
  const conditions = [];
  if (status) conditions.push({ status });
  if (source) conditions.push({ source });
  if (siteKey) {
    const resolved = resolveSiteFilter(siteKey);
    // Primary: enquiries properly linked via the Site relation (siteId set).
    // Fallback: legacy/orphaned rows (siteId: null) that predate the Site
    // relation, matched by their original source string instead - this is
    // what keeps pre-existing enquiries visible under the site filter
    // without ever needing to touch/backfill the historical data.
    conditions.push({
      OR: [{ site: { siteKey: resolved.slug } }, { siteId: null, source: resolved.legacySource }],
    });
  }
  const where = conditions.length ? { AND: conditions } : {};

  const [items, total] = await Promise.all([
    prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { site: { select: { siteKey: true, siteName: true } } },
    }),
    prisma.contactEnquiry.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function setEnquiryStatus(id, status, actorId) {
  const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } });
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  const updated = await prisma.contactEnquiry.update({ where: { id }, data: { status } });
  await logAction({ action: `Enquiry status changed to ${status}`, target: `ENQ-${enquiry.sequenceNumber} (${enquiry.name})`, actorId });
  return updated;
}

// siteKey is the URL slug used in POST /api/enquiries/:source (e.g.
// "aitransformation"), which is also the Site.siteKey - one lookup gets both
// the id to store and the name/supportEmail needed for the notification.
async function createEnquiry({ title, firstName, lastName, name, email, country, city, enquiryType, subject, message, source, siteKey }) {
  const resolvedName = name || [title, firstName, lastName].filter(Boolean).join(' ');
  const resolvedSubject = subject || enquiryType;
  const site = siteKey ? await prisma.site.findUnique({ where: { siteKey } }) : null;
  if (site && !site.contactEnabled) {
    throw ApiError.badRequest('Contact Us is not currently enabled for this site');
  }

  const enquiry = await prisma.contactEnquiry.create({
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
      siteId: site ? site.id : null,
    },
  });

  // Site-branded From when the site has its own sender identity configured
  // (spec §11 - e.g. notifications@healthcentreapp.com); falls back to the
  // mailer's global default From otherwise.
  const from = site && site.senderName && site.senderEmail ? `${site.senderName} <${site.senderEmail}>` : undefined;
  const reference = `ENQ-${enquiry.sequenceNumber}`;

  // A mail failure must never fail the enquiry submission itself - the
  // enquiry is already saved and manageable from AppCentre Admin regardless.
  if (site && site.supportEmail) {
    const notificationSubject = `New enquiry ${reference} — ${site.siteName}`;
    try {
      await sendMail({
        to: site.supportEmail,
        replyTo: email,
        from,
        subject: notificationSubject,
        text: `New enquiry from ${resolvedName} (${email})\nEnquiry type: ${enquiryType || '-'}\n\n${message}`,
        html: `<p>New enquiry from <strong>${escapeHtml(resolvedName)}</strong> (${escapeHtml(email)})</p><p>Enquiry type: ${escapeHtml(enquiryType || '-')}</p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      });
    } catch (err) {
      console.error(`[enquiries] Failed to send notification for ${reference}: ${err.message}`);
      console.log(`[enquiries] Would have sent to ${site.supportEmail} (Reply-To: ${email})\nSubject: ${notificationSubject}\n${message}`);
    }
  }

  // Acknowledgement to the enquirer (spec §5, Email 1) - Reply-To routes any
  // reply straight to the human support mailbox, not back into AppCentre.
  if (site && site.autoReplyEnabled) {
    const ackSubject = `We have received your ${site.siteName} enquiry [${reference}]`;
    try {
      await sendMail({
        to: email,
        replyTo: site.supportEmail,
        from,
        subject: ackSubject,
        text: `Hi ${resolvedName},\n\nThank you for contacting ${site.siteName}. We have received your enquiry (reference ${reference}) and will get back to you shortly.\n\nYour message:\n${message}`,
        html: `<p>Hi ${escapeHtml(resolvedName)},</p><p>Thank you for contacting <strong>${escapeHtml(site.siteName)}</strong>. We have received your enquiry (reference <strong>${escapeHtml(reference)}</strong>) and will get back to you shortly.</p><p>Your message:</p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      });
    } catch (err) {
      console.error(`[enquiries] Failed to send acknowledgement for ${reference}: ${err.message}`);
      console.log(`[enquiries] Would have sent acknowledgement to ${email}\nSubject: ${ackSubject}`);
    }
  }

  return enquiry;
}

module.exports = { listEnquiries, setEnquiryStatus, createEnquiry };
