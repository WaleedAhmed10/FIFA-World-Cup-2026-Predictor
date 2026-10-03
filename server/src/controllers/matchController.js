const mongoose = require('mongoose');
const Match = require('../models/Match');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/matches
const getMatches = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.group) filter.group = req.query.group.toUpperCase();
  if (req.query.team) {
    filter.$or = [{ homeTeam: req.query.team }, { awayTeam: req.query.team }];
  }

  const matches = await Match.find(filter)
    .populate('homeTeam', 'name flag group')
    .populate('awayTeam', 'name flag group')
    .sort({ date: 1 });

  res.json({ success: true, data: matches });
});

// @route GET /api/matches/:id
const getMatchById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid match id');
  const match = await Match.findById(req.params.id)
    .populate('homeTeam', 'name flag group')
    .populate('awayTeam', 'name flag group');
  if (!match) throw new ApiError(404, 'Match not found');
  res.json({ success: true, data: match });
});

// @route GET /api/matches/stage/:stage
const getMatchesByStage = asyncHandler(async (req, res) => {
  const matches = await Match.find({ stage: req.params.stage })
    .populate('homeTeam', 'name flag group')
    .populate('awayTeam', 'name flag group')
    .sort({ matchNumber: 1 });
  res.json({ success: true, data: matches });
});

// @route PUT /api/matches/:id  (admin only)
// Records a result and recalculates the two teams' group-stage stats atomically-ish.
const updateMatchResult = asyncHandler(async (req, res) => {
  const { homeScore, awayScore, status } = req.body;

  const match = await Match.findById(req.params.id).populate('homeTeam awayTeam');
  if (!match) throw new ApiError(404, 'Match not found');
  if (!match.homeTeam || !match.awayTeam) throw new ApiError(400, 'Match has no assigned teams yet');

  const wasCompleted = match.status === 'Completed';

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.status = status || 'Completed';

  // Only group-stage results feed the group table (knockout games must not).
  if (match.status === 'Completed' && !wasCompleted && match.stage === 'Group Stage') {
    const home = match.homeTeam;
    const away = match.awayTeam;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (homeScore > awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeScore < awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }

    await home.save();
    await away.save();
  }

  await match.save();

  // Award prediction points only once the result is final.
  if (match.status === 'Completed') await awardPredictionPoints(match);

  res.json({ success: true, data: match });
});

// Correct scoreline = 3 pts, correct result (W/D/L) only = 1 pt.
const awardPredictionPoints = async (match) => {
  const User = require('../models/User');
  for (const pred of match.predictions) {
    let points = 0;
    const actualResult = Math.sign(match.homeScore - match.awayScore);
    const predResult = Math.sign(pred.homeScore - pred.awayScore);

    if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) points = 3;
    else if (actualResult === predResult) points = 1;

    pred.points = points;

    const user = await User.findById(pred.user);
    if (user) {
      const userPred = user.predictions.find((p) => p.match.toString() === match._id.toString());
      if (userPred) {
        user.totalPoints += points - (userPred.points || 0);
        userPred.points = points;
      }
      await user.save();
    }
  }
  await match.save();
};

module.exports = { getMatches, getMatchById, getMatchesByStage, updateMatchResult };
