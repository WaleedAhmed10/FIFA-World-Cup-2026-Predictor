const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    flag: { type: String, default: '' },
    group: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], required: true },
    fifaRanking: { type: Number, min: 1 },
    points: { type: Number, default: 0 },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    groupPosition: { type: Number, default: 0 },
    qualified: { type: String, enum: ['Not Decided', 'Qualified', 'Potential', 'Eliminated'], default: 'Not Decided' }
  },
  { timestamps: true }
);

teamSchema.index({ group: 1, points: -1, goalDifference: -1, goalsFor: -1 });

module.exports = mongoose.model('Team', teamSchema);
