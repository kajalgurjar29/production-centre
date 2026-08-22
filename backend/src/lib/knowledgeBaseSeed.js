const KNOWLEDGE_ARTICLES = [
  {
    title: 'What services do you offer?',
    category: 'Services & Assessments',
    keywords: 'what services, services do you offer, what do you offer',
    answer:
      'We offer AI Readiness Assessments, AI Transformation Advisory, Microsoft Copilot Agentic AI Readiness Assessments and Transformation Advisory, Agentic AI Fluency and Citizen Agentic AI Fluency training, and tailored Microsoft Copilot Agentic AI transformation assignments.',
  },
  {
    title: 'How do I request an AI Readiness Assessment?',
    category: 'Services & Assessments',
    keywords: 'readiness assessment, ai readiness, request an ai readiness',
    answer:
      'Our Microsoft Copilot Agentic AI Readiness Assessment with Roadmap starts from £12,500 and typically takes 10 working days. It covers leadership, workforce, Microsoft Copilot, data and governance readiness, and delivers a maturity score, capability gaps and a transformation roadmap. Click "Request an AI Readiness Assessment" in the navigation bar, or visit Contact Us.',
  },
  {
    title: 'How do I book training?',
    category: 'Training Programmes',
    keywords: 'book training, how do i book, training programmes, what training',
    answer:
      'We offer Microsoft AB-900, AB-730 and AB-731 certification preparation, the BCS Foundation Certificate in Digital Business Change, Citizen Agentic AI Fluency workshops, and bespoke training. Most programmes run over two weeks with fees between £250 and £350 per delegate. Visit Contact Us and choose Group, Onsite or Bespoke Training as your enquiry type.',
  },
  {
    title: 'What is AB-900 (Microsoft 365 Copilot and Agent Administration Fundamentals)?',
    category: 'Training Programmes',
    keywords: 'ab-900, ab 900, microsoft 365 copilot and agent administration, copilot administration fundamentals',
    answer:
      'AB-900 (Microsoft 365 Copilot and Agent Administration Fundamentals) develops foundational knowledge of Microsoft 365 Copilot, agents, administration and responsible organisational use. Delivered interactively online for £250 per participant.',
  },
  {
    title: 'What is AB-730 (AI Business Professional)?',
    category: 'Training Programmes',
    keywords: 'ab-730, ab 730, ai business professional',
    answer:
      'AB-730 (AI Business Professional) builds practical knowledge for using Microsoft AI and Copilot effectively in business roles and workflows. Delivered interactively online for £250 per participant.',
  },
  {
    title: 'What is AB-731 (AI Transformation Leader)?',
    category: 'Training Programmes',
    keywords: 'ab-731, ab 731, ai transformation leader',
    answer:
      'AB-731 (AI Transformation Leader) prepares leaders to guide responsible Microsoft Copilot Agentic AI adoption and align transformation with business priorities. Delivered interactively online for £350 per participant.',
  },
  {
    title: 'What is the BCS Foundation Certificate in Digital Change Management?',
    category: 'Training Programmes',
    keywords: 'bcs digital business change, bcs digital change management, bcs foundation certificate, bcs course, bcs training',
    answer:
      'Our BCS Foundation Certificate in Digital Change Management course builds understanding of digital change, organisational readiness and the people and process factors needed for successful transformation. Delivered interactively online for £250 per participant.',
  },
  {
    title: 'What is Agentic AI Fluency?',
    category: 'Training Programmes',
    keywords: 'agentic ai fluency, citizen agentic ai fluency, what is agentic ai',
    answer:
      'Agentic AI Fluency is our training track for confidently using agentic AI tools. We also run a free Citizen Agentic AI Fluency session on the first Sunday evening of every month, with limited spaces available on request.',
  },
  {
    title: 'Do you offer bespoke or tailored training and transformation assignments?',
    category: 'Services & Assessments',
    keywords: 'bespoke training, tailored training, bespoke transformation, tailored assignment',
    answer:
      "We shape bespoke Microsoft Copilot Agentic AI transformation assignments around your organisation's specific requirements, covering adoption, governance, workforce readiness, business change and implementation planning. Scope, duration and outputs are agreed before work begins.",
  },
  {
    title: 'How much does training cost?',
    category: 'Pricing & Discounts',
    keywords: 'training cost, training fees, training price, how much is training',
    answer:
      'Standard programme fees are usually between £250 and £350 per delegate. Group or organisational discounts may apply, and eligible charities may receive discounted fees.',
  },
  {
    title: 'Is the examination fee included in training?',
    category: 'Pricing & Discounts',
    keywords: 'exam fee, examination fee, exam included',
    answer:
      'No, examination and certification fees are not included in the training fee. Candidates register and pay the relevant examination body separately.',
  },
  {
    title: 'Do you offer group or team training?',
    category: 'Training Programmes',
    keywords: 'group training, team training, organisation training',
    answer:
      'Yes, group training is available for leadership teams, employees, project teams and professional communities, with discounts depending on delegate numbers and delivery requirements.',
  },
  {
    title: 'Can training be customised for our organisation?',
    category: 'Training Programmes',
    keywords: 'customise training, customisable, tailor the course',
    answer:
      'Yes, training can be customised around your organisational examples, workforce roles, Microsoft Copilot use cases, AI governance requirements and sector-specific scenarios.',
  },
  {
    title: 'Is training available internationally?',
    category: 'Training Programmes',
    keywords: 'international, different country, time zone, overseas',
    answer: 'Yes, training is available internationally, subject to availability, time zones and suitable delivery arrangements.',
  },
  {
    title: 'What equipment do I need for training?',
    category: 'Training Programmes',
    keywords: 'equipment needed, what do i need for training, requirements for training',
    answer:
      'You will need a suitable computer or tablet, reliable internet, a working microphone, and access to the agreed online meeting platform, plus any required Microsoft or exam body account.',
  },
  {
    title: 'Do I get a certificate of completion?',
    category: 'Certification',
    keywords: 'certificate of completion, do i get a certificate',
    answer:
      'Delegates who complete the required training sessions receive a certificate of completion from AI Transformation Professionals. This is separate from, and does not replace, official certification awarded by Microsoft, BCS or another examination body.',
  },
  {
    title: 'Do you offer discounts for charities?',
    category: 'Pricing & Discounts',
    keywords: 'discount, charity discount, offer discounts',
    answer:
      'Yes, registered charitable organisations may qualify for a 50% discount on eligible readiness, training and transformation assignments. Choose "Charity Organisation Discount" as your enquiry type on the Contact Us page to apply.',
  },
  {
    title: 'How do I submit a review?',
    category: 'Reviews',
    keywords: 'submit a review, how do i submit a review, leave a review',
    answer: 'To submit a review, go to the Reviews page, select a star rating, add your review details if needed, accept the terms and submit.',
  },
  {
    title: 'How do I contact you?',
    category: 'Contact & Enquiries',
    keywords: 'how do i contact you, contact details, get in touch',
    answer: 'You can reach us via the Contact Us page, by emailing Connect@AITP.uk, or via WhatsApp on +44 782 201 3052.',
  },
  {
    title: 'How do I join the Consultant Network?',
    category: 'Contact & Enquiries',
    keywords: 'consultant network, join as a consultant',
    answer:
      'Our Consultant Network connects experienced AI transformation consultants with client engagements. Choose "Consultant Network Enquiry" on the Contact Us page to register your interest.',
  },
  {
    title: 'What publications do you offer?',
    category: 'Publications',
    keywords: 'publications, books, exam preparation guide',
    answer:
      'We publish books and exam preparation guides, including "Citizens\' Agentic AI", "Agentic AI Workforce Transformation", and exam prep guides for AB-900, AB-730, AB-731 and BCS Digital Change Management. See the Publications page for details.',
  },
  {
    title: 'Who is AI Transformation Professionals?',
    category: 'Company Info',
    keywords: 'who are you, about the company, what is ai transformation professionals',
    answer:
      'AI Transformation Professionals is a specialist consulting and training organisation focused on AI readiness, workforce capability and Microsoft Copilot Agentic AI transformation. Assess. Train. Transform.',
  },
];

// Runs on every server start (see server.js). Inserts only the starter
// articles whose title isn't already present, so it's safe to run against a
// database that already has real content (whether from an earlier partial
// seed or articles someone has since added via the admin panel) - existing
// rows are never touched or duplicated. Kept separate from prisma/seed.js
// because that script also creates demo users/adverts/reviews - fine for
// local dev, not something that should ever run automatically against a
// production database.
async function ensureKnowledgeBaseSeeded(prisma) {
  const existingTitles = new Set((await prisma.knowledgeArticle.findMany({ select: { title: true } })).map((a) => a.title));

  const missing = KNOWLEDGE_ARTICLES.filter((a) => !existingTitles.has(a.title));
  if (missing.length === 0) {
    console.log('Knowledge base already contains all starter articles.');
    return;
  }

  await prisma.knowledgeArticle.createMany({
    data: missing.map((a) => ({ ...a, status: 'PUBLISHED', updatedBy: 'Seed Script' })),
  });
  console.log(`Knowledge base seeded ${missing.length} missing starter articles.`);
}

module.exports = { KNOWLEDGE_ARTICLES, ensureKnowledgeBaseSeeded };
