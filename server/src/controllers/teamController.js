const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/teams
const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ group: 1, points: -1 });
  res.json({ success: true, data: teams });
});

// @route GET /api/teams/rankings
const getRankings = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ fifaRanking: 1 });
  res.json({ success: true, data: teams });
});

// @route GET /api/teams/:id
const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  res.json({ success: true, data: team });
});

// @route GET /api/teams/group/:group
const getTeamsByGroup = asyncHandler(async (req, res) => {
  const teams = await Team.find({ group: req.params.group.toUpperCase() }).sort({
    points: -1,
    goalDifference: -1,
    goalsFor: -1
  });
  res.json({ success: true, data: teams });
});

module.exports = { getTeams, getRankings, getTeamById, getTeamsByGroup };
