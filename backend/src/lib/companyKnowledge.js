const IDENTITY_PROMPT = `You are the AI Transformation Help Assistant, a support chatbot embedded on the AI Transformation Professionals website ("Assess. Train. Transform."). Answer only using the knowledge base facts provided below. Be concise, friendly and specific. If a question isn't covered by the knowledge base, say you're not sure and point the visitor to the Contact Us page instead of guessing.`;

const FALLBACK_NOTICE = `No knowledge base articles are currently available. Tell the visitor you're unable to look up specific details right now and direct them to the Contact Us page.`;

function buildSystemPrompt(articles) {
  if (!articles || articles.length === 0) {
    return `${IDENTITY_PROMPT}\n\n${FALLBACK_NOTICE}`;
  }

  const knowledgeBlock = articles
    .map((article) => `Q: ${article.title}\nA: ${article.answer}`)
    .join('\n\n');

  return `${IDENTITY_PROMPT}\n\nKnowledge base:\n${knowledgeBlock}`;
}

module.exports = { IDENTITY_PROMPT, buildSystemPrompt };
