const OpenAI = require('openai');
const { openaiApiKey, openaiModel } = require('../config/env');

const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

module.exports = { client, MODEL: openaiModel };
