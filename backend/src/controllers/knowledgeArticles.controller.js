const asyncHandler = require('../utils/asyncHandler');
const articlesService = require('../services/knowledgeArticles.service');

const list = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const articles = await articlesService.listArticles({ status, category, search });
  res.json({ success: true, data: articles });
});

const getById = asyncHandler(async (req, res) => {
  const article = await articlesService.getArticleById(req.params.id);
  res.json({ success: true, data: article });
});

const create = asyncHandler(async (req, res) => {
  const article = await articlesService.createArticle(req.body);
  res.status(201).json({ success: true, data: article });
});

const update = asyncHandler(async (req, res) => {
  const article = await articlesService.updateArticle(req.params.id, req.body);
  res.json({ success: true, data: article });
});

const publish = asyncHandler(async (req, res) => {
  const article = await articlesService.setArticleStatus(req.params.id, 'PUBLISHED', req.body);
  res.json({ success: true, data: article });
});

const deactivate = asyncHandler(async (req, res) => {
  const article = await articlesService.setArticleStatus(req.params.id, 'INACTIVE', req.body);
  res.json({ success: true, data: article });
});

const reactivate = asyncHandler(async (req, res) => {
  const article = await articlesService.setArticleStatus(req.params.id, 'PUBLISHED', req.body);
  res.json({ success: true, data: article });
});

module.exports = { list, getById, create, update, publish, deactivate, reactivate };
