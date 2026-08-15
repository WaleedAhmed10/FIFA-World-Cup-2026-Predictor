const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const REFRESH_COOKIE_NAME = 'refreshToken';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth'
});

const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Keep only the last 5 refresh tokens per user (handles multiple devices, bounds growth)
  user.refreshTokens = [...user.refreshTokens.slice(-4), { token: refreshToken }];
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
  return accessToken;
};

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) throw new ApiError(409, 'Username or email already in use');

  const user = await User.create({ username, email, password });
  const accessToken = await issueTokens(res, user);

  res.status(201).json({ success: true, accessToken, user: user.toSafeObject() });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  if (user.isLocked) throw new ApiError(423, 'Account temporarily locked due to failed attempts. Try again later.');

  const match = await user.comparePassword(password);
  if (!match) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      user.loginAttempts = 0;
    }
    await user.save();
    throw new ApiError(401, 'Invalid credentials');
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  const accessToken = await issueTokens(res, user);

  res.json({ success: true, accessToken, user: user.toSafeObject() });
});

// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.some((rt) => rt.token === token)) {
    throw new ApiError(401, 'Refresh token not recognized');
  }

  // Rotate: remove the used token, issue a new pair
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  const accessToken = await issueTokens(res, user);

  res.json({ success: true, accessToken, user: user.toSafeObject() });
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
        await user.save();
      }
    } catch (err) {
      // token already invalid; nothing to clean up server-side
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = { register, login, refresh, logout, getMe };
