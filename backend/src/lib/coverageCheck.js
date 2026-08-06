const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'did', 'how', 'what', 'why', 'when', 'where',
  'who', 'i', 'my', 'me', 'to', 'for', 'of', 'on', 'in', 'you', 'your', 'can', 'will', 'please',
  'about', 'with', 'and', 'or', 'it', 'this', 'that', 'be', 'have', 'has',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function articleKeywordPhrases(article) {
  const fromKeywords = (article.keywords || '')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const fromTitle = [article.title.toLowerCase()];
  return [...fromKeywords, ...fromTitle];
}

function scoreArticle(article, cleanText, tokens) {
  let score = 0;
  articleKeywordPhrases(article).forEach((phrase) => {
    if (cleanText.includes(phrase)) {
      score += phrase.split(' ').length * 2;
      return;
    }
    const phraseTokens = phrase.split(' ');
    const hits = phraseTokens.filter((t) => tokens.includes(t)).length;
    if (hits === phraseTokens.length) {
      score += phraseTokens.length;
    } else if (hits > 0) {
      score += hits * 0.5;
    }
  });
  return score;
}

/** Mirrors the keyword-match heuristic the Help widget used before this was backed by an LLM,
 * so "unanswered question" logging reflects real knowledge-base gaps rather than the model's confidence. */
function isCoveredByKnowledgeBase(message, articles) {
  const cleanText = message.toLowerCase().trim();
  const tokens = tokenize(cleanText);
  const bestScore = articles.reduce((best, article) => {
    const score = scoreArticle(article, cleanText, tokens);
    return score > best ? score : best;
  }, 0);
  return bestScore >= 1;
}

module.exports = { isCoveredByKnowledgeBase };
