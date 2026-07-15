const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worldcup2026')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  predictions: [{
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    homeScore: Number,
    awayScore: Number,
    points: { type: Number, default: 0 }
  }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const teamSchema = new mongoose.Schema({
  name: String, country: String, flag: String,
  group: { type: String, enum: ['A','B','C','D','E','F','G','H','I','J','K','L'] },
  fifaRanking: Number,
  points: { type: Number, default: 0 },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  groupPosition: { type: Number, default: 0 },
  qualified: { type: String, default: 'Not Decided' }
});

const matchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  date: Date,
  stage: { type: String, enum: ['Group Stage','Round of 32','Round of 16','Quarter Final','Semi Final','3rd Place','Final'] },
  group: { type: String, enum: ['A','B','C','D','E','F','G','H','I','J','K','L',null], default: null },
  status: { type: String, enum: ['Scheduled','Live','Completed'], default: 'Scheduled' },
  venue: String,
  city: String,
  matchNumber: Number,
  predictions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    homeScore: Number,
    awayScore: Number
  }]
});

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);
const Match = mongoose.model('Match', matchSchema);

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ message: 'User exists' });
    
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey');
    res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey');
    res.json({ token, user: { id: user._id, username, email: user.email, role: user.role, totalPoints: user.totalPoints } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ group: 1, points: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/teams/group/:group', async (req, res) => {
  try {
    const teams = await Team.find({ group: req.params.group }).sort({ points: -1, goalDifference: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/standings/groups', async (req, res) => {
  try {
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    const standings = {};
    
    for (const group of groups) {
      const teams = await Team.find({ group }).sort({ points: -1, goalDifference: -1, goalsFor: -1 });
      teams.forEach((team, index) => {
        team.groupPosition = index + 1;
        if (index < 2) team.qualified = 'Qualified';
        else if (index === 2) team.qualified = 'Potential';
        else team.qualified = 'Eliminated';
        team.save();
      });
      standings[group] = teams;
    }
    res.json(standings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/standings/best-third', async (req, res) => {
  try {
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    const thirdTeams = [];
    
    for (const group of groups) {
      const teams = await Team.find({ group }).sort({ points: -1, goalDifference: -1, goalsFor: -1 });
      if (teams.length >= 3) thirdTeams.push({ ...teams[2].toObject(), group });
    }
    
    thirdTeams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    res.json({ qualified: thirdTeams.slice(0, 8), eliminated: thirdTeams.slice(8), all: thirdTeams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/standings/knockout-bracket', async (req, res) => {
  try {
    const stages = ['Round of 32','Round of 16','Quarter Final','Semi Final','Bronze Final','Final'];
    const bracket = {};
    
    for (const stage of stages) {
      bracket[stage] = await Match.find({ stage })
        .populate('homeTeam', 'name flag group')
        .populate('awayTeam', 'name flag group')
        .sort({ matchNumber: 1 });
    }
    res.json(bracket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name flag group')
      .populate('awayTeam', 'name flag group')
      .sort({ date: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/matches/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });    
    const { homeScore, awayScore, status } = req.body;
    const match = await Match.findById(req.params.id).populate('homeTeam awayTeam');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = status || 'Completed';
    
    if (status === 'Completed' || homeScore !== null) {
      const home = match.homeTeam, away = match.awayTeam;
      home.played += 1; away.played += 1;
      home.goalsFor += homeScore; home.goalsAgainst += awayScore;
      away.goalsFor += awayScore; away.goalsAgainst += homeScore;
      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
      
      if (homeScore > awayScore) { home.won += 1; home.points += 3; away.lost += 1; }
      else if (homeScore < awayScore) { away.won += 1; away.points += 3; home.lost += 1; }
      else { home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1; }
    
      await home.save(); await away.save();
    }    
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/predictions', auth, async (req, res) => {
  try {
    const { matchId, homeScore, awayScore } = req.body;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.status === 'Completed') return res.status(400).json({ message: 'Match completed' });
    
    const user = await User.findById(req.user.id);
    const existing = user.predictions.find(p => p.match.toString() === matchId);
    if (existing) { existing.homeScore = homeScore; existing.awayScore = awayScore; }
    else { user.predictions.push({ match: matchId, homeScore, awayScore }); }
    await user.save();
    
    const pred = match.predictions.find(p => p.user.toString() === req.user.id);
    if (pred) { pred.homeScore = homeScore; pred.awayScore = awayScore; }
    else { match.predictions.push({ user: req.user.id, homeScore, awayScore }); }
    await match.save();
    
    res.json({ message: 'Prediction saved!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/predictions/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'predictions.match', populate: [{ path: 'homeTeam', select: 'name flag' }, { path: 'awayTeam', select: 'name flag' }] });
    res.json(user.predictions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find().select('username totalPoints').sort({ totalPoints: -1 }).limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const teamsData = {
      'A': [{ name: 'Mexico', country: 'Mexico', flag: '🇲🇽', fifaRanking: 15 }, { name: 'South Africa', country: 'South Africa', flag: '🇿🇦', fifaRanking: 58 }, { name: 'South Korea', country: 'South Korea', flag: '🇰🇷', fifaRanking: 28 }, { name: 'Czechia', country: 'Czech Republic', flag: '🇨🇿', fifaRanking: 34 }],
      'B': [{ name: 'Canada', country: 'Canada', flag: '🇨🇦', fifaRanking: 41 }, { name: 'Bosnia-Herzegovina', country: 'Bosnia', flag: '🇧🇦', fifaRanking: 71 }, { name: 'Qatar', country: 'Qatar', flag: '🇶🇦', fifaRanking: 50 }, { name: 'Switzerland', country: 'Switzerland', flag: '🇨🇭', fifaRanking: 14 }],
      'C': [{ name: 'Brazil', country: 'Brazil', flag: '🇧🇷', fifaRanking: 3 }, { name: 'Morocco', country: 'Morocco', flag: '🇲🇦', fifaRanking: 13 }, { name: 'Haiti', country: 'Haiti', flag: '🇭🇹', fifaRanking: 87 }, { name: 'Scotland', country: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fifaRanking: 36 }],
      'D': [{ name: 'USA', country: 'United States', flag: '🇺🇸', fifaRanking: 16 }, { name: 'Paraguay', country: 'Paraguay', flag: '🇵🇾', fifaRanking: 53 }, { name: 'Australia', country: 'Australia', flag: '🇦🇺', fifaRanking: 27 }, { name: 'Türkiye', country: 'Turkey', flag: '🇹🇷', fifaRanking: 40 }],
      'E': [{ name: 'Germany', country: 'Germany', flag: '🇩🇪', fifaRanking: 11 }, { name: 'Curaçao', country: 'Curaçao', flag: '🇨🇼', fifaRanking: 86 }, { name: 'Ivory Coast', country: 'Ivory Coast', flag: '🇨🇮', fifaRanking: 49 }, { name: 'Ecuador', country: 'Ecuador', flag: '🇪🇨', fifaRanking: 32 }],
      'F': [{ name: 'Netherlands', country: 'Netherlands', flag: '🇳🇱', fifaRanking: 6 }, { name: 'Japan', country: 'Japan', flag: '🇯🇵', fifaRanking: 19 }, { name: 'Sweden', country: 'Sweden', flag: '🇸🇪', fifaRanking: 23 }, { name: 'Tunisia', country: 'Tunisia', flag: '🇹🇳', fifaRanking: 31 }],
      'G': [{ name: 'Belgium', country: 'Belgium', flag: '🇧🇪', fifaRanking: 4 }, { name: 'Egypt', country: 'Egypt', flag: '🇪🇬', fifaRanking: 39 }, { name: 'Iran', country: 'Iran', flag: '🇮🇷', fifaRanking: 20 }, { name: 'New Zealand', country: 'New Zealand', flag: '🇳🇿', fifaRanking: 94 }],
      'H': [{ name: 'Spain', country: 'Spain', flag: '🇪🇸', fifaRanking: 8 }, { name: 'Cabo Verde', country: 'Cabo Verde', flag: '🇨🇻', fifaRanking: 65 }, { name: 'Saudi Arabia', country: 'Saudi Arabia', flag: '🇸🇦', fifaRanking: 54 }, { name: 'Uruguay', country: 'Uruguay', flag: '🇺🇾', fifaRanking: 12 }],
      'I': [{ name: 'France', country: 'France', flag: '🇫🇷', fifaRanking: 2 }, { name: 'Senegal', country: 'Senegal', flag: '🇸🇳', fifaRanking: 18 }, { name: 'Iraq', country: 'Iraq', flag: '🇮🇶', fifaRanking: 63 }, { name: 'Norway', country: 'Norway', flag: '🇳🇴', fifaRanking: 46 }],
      'J': [{ name: 'Argentina', country: 'Argentina', flag: '🇦🇷', fifaRanking: 1 }, { name: 'Algeria', country: 'Algeria', flag: '🇩🇿', fifaRanking: 37 }, { name: 'Austria', country: 'Austria', flag: '🇦🇹', fifaRanking: 22 }, { name: 'Jordan', country: 'Jordan', flag: '🇯🇴', fifaRanking: 70 }],
      'K': [{ name: 'Portugal', country: 'Portugal', flag: '🇵🇹', fifaRanking: 5 }, { name: 'DR Congo', country: 'DR Congo', flag: '🇨🇩', fifaRanking: 67 }, { name: 'Uzbekistan', country: 'Uzbekistan', flag: '🇺🇿', fifaRanking: 74 }, { name: 'Colombia', country: 'Colombia', flag: '🇨🇴', fifaRanking: 10 }],
      'L': [{ name: 'England', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fifaRanking: 7 }, { name: 'Croatia', country: 'Croatia', flag: '🇭🇷', fifaRanking: 9 }, { name: 'Ghana', country: 'Ghana', flag: '🇬🇭', fifaRanking: 60 }, { name: 'Panama', country: 'Panama', flag: '🇵🇦', fifaRanking: 45 }]
    };

    await Team.deleteMany({});
    await Match.deleteMany({});

    const venues = ['MetLife Stadium','SoFi Stadium','AT&T Stadium','NRG Stadium','Hard Rock Stadium','Mercedes-Benz Stadium','Lumen Field',"Levi's Stadium",'Gillette Stadium','Lincoln Financial Field','Arrowhead Stadium','BMO Field','BC Place','Estadio Azteca','Estadio Akron','Estadio BBVA'];
    const cities = ['New York','Los Angeles','Dallas','Houston','Miami','Atlanta','Seattle','San Francisco','Boston','Philadelphia','Kansas City','Toronto','Vancouver','Mexico City','Guadalajara','Monterrey'];

    let matchNum = 1;
    const teams = {};

    for (const [group, groupTeams] of Object.entries(teamsData)) {
      const created = [];
      for (const data of groupTeams) {
        const team = new Team({ ...data, group });
        await team.save();
        created.push(team);
        teams[team.name] = team;
      }

      for (let i = 0; i < created.length; i++) {
        for (let j = i + 1; j < created.length; j++) {
          const date = new Date(2026, 5, 11 + (matchNum % 16));
          date.setHours(12 + (matchNum % 9), (matchNum * 7) % 60);
          const match = new Match({
            homeTeam: created[i]._id, awayTeam: created[j]._id,
            date, stage: 'Group', group,
            venue: venues[matchNum % venues.length],
            city: cities[matchNum % cities.length],
            matchNumber: matchNum++
          });
          await match.save();
        }
      }
    }

    const stages = ['Round of 32','Round of 16','Quarter Final','Semi Final','Bronze Final','Final'];
    const counts = [16, 8, 4, 2, 1, 1];
    let kDate = new Date(2026, 5, 28);
    
    for (let s = 0; s < stages.length; s++) {
      for (let i = 0; i < counts[s]; i++) {
        const match = new Match({
          date: new Date(kDate),
          stage: stages[s],
          venue: venues[(s + i) % venues.length],
          city: cities[(s + i) % cities.length],
          matchNumber: matchNum++
        });
        await match.save();
        kDate.setDate(kDate.getDate() + 1);
      }
      kDate.setDate(kDate.getDate() + 2);
    }

    res.json({ message: 'Seeded!', teams: await Team.countDocuments(), matches: await Match.countDocuments() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));