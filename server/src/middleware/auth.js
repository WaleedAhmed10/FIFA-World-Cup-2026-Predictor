const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the short-lived access token and attaches the user to the request.
// Requires a live DB lookup (rather than trusting the token payload alone) so that
// a deleted/deactivated user is rejected immediately, not just after token expiry.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError(401, 'Not authenticated: no token provided');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authenticated: invalid or expired token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'Not authenticated: user no longer exists');

  req.user = { id: user._id.toString(), role: user.role };
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin privileges required'));
  }
  next();
};

module.exports = { protect, adminOnly };
