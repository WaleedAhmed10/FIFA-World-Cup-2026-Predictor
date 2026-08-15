const Team = require('../models/Team');
const Match = require('../models/Match');
const asyncHandler = require('../utils/asyncHandler');

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// @route GET /api/standings/groups
const getGroupStandings = asyncHandler(async (req, res) => {
  const standings = {};

  for (const group of GROUPS) {
    const teams = await Team.find({ group }).sort({ points: -1, goalDifference: -1, goalsFor: -1 });
    const updates = teams.map((team, index) => {
      team.groupPosition = index + 1;
      if (index < 2) team.qualified = 'Qualified';
      else if (index === 2) team.qualified = 'Potential';
      else team.qualified = 'Eliminated';
      return team.save();
    });
    await Promise.all(updates);
    standings[group] = teams;
  }

  res.json({ success: true, data: standings });
});

// @route GET /api/standings/best-third
const getBestThirdPlaced = asyncHandler(async (req, res) => {
  const thirdTeams = [];

  for (const group of GROUPS) {
    const teams = await Team.find({ group }).sort({ points: -1, goalDifference: -1, goalsFor: -1 });
    if (teams.length >= 3) thirdTeams.push({ ...teams[2].toObject(), group });
  }

  thirdTeams.sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );

  res.json({
    success: true,
    data: { qualified: thirdTeams.slice(0, 8), eliminated: thirdTeams.slice(8), all: thirdTeams }
  });
});

// @route GET /api/standings/knockout-bracket
const getKnockoutBracket = asyncHandler(async (req, res) => {
  const stages = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Bronze Final', 'Final'];
  const bracket = {};

  for (const stage of stages) {
    bracket[stage] = await Match.find({ stage })
      .populate('homeTeam', 'name flag group')
      .populate('awayTeam', 'name flag group')
      .sort({ matchNumber: 1 });
  }

  res.json({ success: true, data: bracket });
});

module.exports = { getGroupStandings, getBestThirdPlaced, getKnockoutBracket };
