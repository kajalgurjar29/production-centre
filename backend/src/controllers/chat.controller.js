const asyncHandler = require('../utils/asyncHandler');
const chatService = require('../services/chat.service');

// Response shape here (`{ reply }` / errors via the shared { success:false, message }
// envelope) is dictated by the existing Help widget's fetch call in TransformHelp.html —
// not the { success, data } envelope the rest of this API uses, since this isn't a resource.
const sendMessage = asyncHandler(async (req, res) => {
  const reply = await chatService.getReply(req.body);
  res.json({ reply });
});

module.exports = { sendMessage };
