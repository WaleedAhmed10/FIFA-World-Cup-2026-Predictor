const Match = require('../models/Match');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/predictions
const submitPrediction = asyncHandler(async (req, res) => {
  const { matchId, homeScore, awayScore } = req.body;

  const match = await Match.findById(matchId);
  if (!match) throw new ApiError(404, 'Match not found');
  if (match.status !== 'Scheduled') throw new ApiError(400, 'Predictions are closed for this match');

  // Lock predictions once a match has kicked off.
  if (new Date(match.date) <= new Date()) throw new ApiError(400, 'Predictions are closed once the match has started');

  const user = await User.findById(req.user.id);

  const existingOnUser = user.predictions.find((p) => p.match.toString() === matchId);
  if (existingOnUser) {
    existingOnUser.homeScore = homeScore;
    existingOnUser.awayScore = awayScore;
  } else {
    user.predictions.push({ match: matchId, homeScore, awayScore });
  }
  await user.save();

  const existingOnMatch = match.predictions.find((p) => p.user.toString() === req.user.id);
  if (existingOnMatch) {
    existingOnMatch.homeScore = homeScore;
    existingOnMatch.awayScore = awayScore;
  } else {
    match.predictions.push({ user: req.user.id, homeScore, awayScore });
  }
  await match.save();

  res.json({ success: true, message: 'Prediction saved' });
});

// @route GET /api/predictions/my
const getMyPredictions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'predictions.match',
    populate: [
      { path: 'homeTeam', select: 'name flag' },
      { path: 'awayTeam', select: 'name flag' }
    ]
  });
  res.json({ success: true, data: user.predictions });
});

// @route GET /api/predictions/match/:matchId
const getMatchPredictionSummary = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.matchId).select('predictions homeTeam awayTeam');
  if (!match) throw new ApiError(404, 'Match not found');

  const total = match.predictions.length;
  res.json({ success: true, data: { totalPredictions: total } });
});

module.exports = { submitPrediction, getMyPredictions, getMatchPredictionSummary };
