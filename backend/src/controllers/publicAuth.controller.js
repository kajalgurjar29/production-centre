const asyncHandler = require('../utils/asyncHandler');
const publicAuthService = require('../services/publicAuth.service');

const register = asyncHandler(async (req, res) => {
  const result = await publicAuthService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const requestOtp = asyncHandler(async (req, res) => {
  const result = await publicAuthService.requestOtp(req.body.email);
  res.json({ success: true, data: result });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await publicAuthService.verifyOtp(req.body.email, req.body.code);
  res.json({ success: true, data: result });
});

module.exports = { register, requestOtp, verifyOtp };
