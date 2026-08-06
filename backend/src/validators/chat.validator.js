const { z } = require('zod');

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;

const historyEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

const chatSchema = z.object({
  message: z.string().trim().min(1, 'message is required').max(MAX_MESSAGE_LENGTH),
  history: z.array(historyEntrySchema).optional().default([]),
  sessionId: z.string().max(200).optional(),
});

module.exports = { chatSchema, MAX_HISTORY_MESSAGES };
