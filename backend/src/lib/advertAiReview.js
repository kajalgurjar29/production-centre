const { client, MODEL } = require('./openaiClient');

const SYSTEM_PROMPT =
  'You review classified adverts before they reach human moderation. Check the title, topic and message for ' +
  'prohibited content (illegal goods/services, hate speech, scams, misleading claims) and basic clarity. ' +
  'Never use the word "Rejected" - if changes are needed, describe them as amendments. ' +
  'Respond with strict JSON only: {"approved": boolean, "feedback": string}. ' +
  'If approved is true, feedback should briefly confirm no issues were found.';

// Best-effort pre-filter before an advert reaches human moderation. Degrades
// gracefully (skips straight to human review) when no OpenAI key is
// configured, same pattern as the Help chatbot.
async function reviewAdvertContent({ title, topic, description }) {
  if (!client) {
    return { approved: true, feedback: 'AI review is not configured - sent directly to admin review.', skipped: true };
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Title: ${title}\nTopic: ${topic || '(none)'}\nMessage: ${description || '(none)'}` },
      ],
    });
    const raw = completion.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return { approved: !!parsed.approved, feedback: String(parsed.feedback || ''), skipped: false };
  } catch (err) {
    console.error('Advert AI review failed:', err.message);
    return { approved: true, feedback: 'AI review could not run - sent directly to admin review.', skipped: true };
  }
}

module.exports = { reviewAdvertContent };
