const asyncHandler = require('../utils/asyncHandler');
const questionsService = require('../services/knowledgeQuestions.service');

const list = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const questions = await questionsService.listQuestions({ status, search });
  res.json({ success: true, data: questions });
});

const review = asyncHandler(async (req, res) => {
  const question = await questionsService.reviewQuestion(req.params.id);
  res.json({ success: true, data: question });
});

module.exports = { list, review };
