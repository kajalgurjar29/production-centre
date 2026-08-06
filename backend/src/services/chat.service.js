const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { client, MODEL } = require('../lib/openaiClient');
const { buildSystemPrompt } = require('../lib/companyKnowledge');
const { isCoveredByKnowledgeBase } = require('../lib/coverageCheck');

async function getPublishedArticles() {
  return prisma.knowledgeArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' },
  });
}

async function logUnansweredQuestion(question, sessionId) {
  try {
    await prisma.unansweredQuestion.create({ data: { question, sessionId } });
  } catch (err) {
    console.error('Failed to log unanswered question:', err.message);
  }
}

async function getReply({ message, history, sessionId }) {
  if (!client) {
    throw new ApiError(500, 'Assistant is not configured correctly.');
  }

  const articles = await getPublishedArticles();

  if (!isCoveredByKnowledgeBase(message, articles)) {
    await logUnansweredQuestion(message, sessionId || 'anonymous');
  }

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: buildSystemPrompt(articles) },
        ...history.map((entry) => ({ role: entry.role, content: entry.content })),
        { role: 'user', content: message },
      ],
    });
  } catch (err) {
    if (err?.status === 401) {
      console.error('OpenAI auth error - check OPENAI_API_KEY:', err.message);
      throw new ApiError(500, 'Assistant is not configured correctly.');
    }
    if (err?.status === 429) {
      throw new ApiError(429, 'The assistant is busy right now. Please try again shortly.');
    }
    console.error('OpenAI request failed:', err);
    throw new ApiError(502, 'Failed to reach the assistant. Please try again.');
  }

  const reply = completion.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new ApiError(502, 'No response received from the assistant.');
  }

  return reply;
}

module.exports = { getReply };
