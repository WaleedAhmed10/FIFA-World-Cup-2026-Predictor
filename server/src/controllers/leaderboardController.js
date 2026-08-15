const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const users = await User.find().select('username totalPoints').sort({ totalPoints: -1 }).limit(limit);
  res.json({ success: true, data: users });
});

module.exports = { getLeaderboard };
