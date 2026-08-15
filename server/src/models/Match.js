const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    homeScore: { type: Number, default: null, min: 0 },
    awayScore: { type: Number, default: null, min: 0 },
    date: { type: Date, required: true },
    stage: {
      type: String,
      enum: ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Bronze Final', 'Final'],
      required: true
    },
    group: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', null], default: null },
    status: { type: String, enum: ['Scheduled', 'Live', 'Completed'], default: 'Scheduled' },
    venue: { type: String, trim: true },
    city: { type: String, trim: true },
    matchNumber: { type: Number, required: true, unique: true },
    predictions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        homeScore: { type: Number, min: 0 },
        awayScore: { type: Number, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

matchSchema.index({ stage: 1, matchNumber: 1 });
matchSchema.index({ date: 1 });

module.exports = mongoose.model('Match', matchSchema);
