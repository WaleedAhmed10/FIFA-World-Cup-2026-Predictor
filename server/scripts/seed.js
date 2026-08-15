// Seeds teams and the full match schedule (group stage + knockout placeholders).
// Run locally / via CI job — this is intentionally NOT exposed as an HTTP endpoint,
// since a public /api/seed route would let anyone wipe the database.
//
// Usage: npm run seed   (from the server/ directory)

require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../src/models/Team');
const Match = require('../src/models/Match');
const logger = require('../src/utils/logger');

const teamsData = {
  A: [
    { name: 'Mexico', country: 'Mexico', flag: '🇲🇽', fifaRanking: 15 },
    { name: 'South Africa', country: 'South Africa', flag: '🇿🇦', fifaRanking: 58 },
    { name: 'South Korea', country: 'South Korea', flag: '🇰🇷', fifaRanking: 28 },
    { name: 'Czechia', country: 'Czech Republic', flag: '🇨🇿', fifaRanking: 34 }
  ],
  B: [
    { name: 'Canada', country: 'Canada', flag: '🇨🇦', fifaRanking: 41 },
    { name: 'Bosnia-Herzegovina', country: 'Bosnia', flag: '🇧🇦', fifaRanking: 71 },
    { name: 'Qatar', country: 'Qatar', flag: '🇶🇦', fifaRanking: 50 },
    { name: 'Switzerland', country: 'Switzerland', flag: '🇨🇭', fifaRanking: 14 }
  ],
  C: [
    { name: 'Brazil', country: 'Brazil', flag: '🇧🇷', fifaRanking: 3 },
    { name: 'Morocco', country: 'Morocco', flag: '🇲🇦', fifaRanking: 13 },
    { name: 'Haiti', country: 'Haiti', flag: '🇭🇹', fifaRanking: 87 },
    { name: 'Scotland', country: 'Scotland', flag: '🏴', fifaRanking: 36 }
  ],
  D: [
    { name: 'USA', country: 'United States', flag: '🇺🇸', fifaRanking: 16 },
    { name: 'Paraguay', country: 'Paraguay', flag: '🇵🇾', fifaRanking: 53 },
    { name: 'Australia', country: 'Australia', flag: '🇦🇺', fifaRanking: 27 },
    { name: 'Türkiye', country: 'Turkey', flag: '🇹🇷', fifaRanking: 40 }
  ],
  E: [
    { name: 'Germany', country: 'Germany', flag: '🇩🇪', fifaRanking: 11 },
    { name: 'Curaçao', country: 'Curaçao', flag: '🇨🇼', fifaRanking: 86 },
    { name: 'Ivory Coast', country: 'Ivory Coast', flag: '🇨🇮', fifaRanking: 49 },
    { name: 'Ecuador', country: 'Ecuador', flag: '🇪🇨', fifaRanking: 32 }
  ],
  F: [
    { name: 'Netherlands', country: 'Netherlands', flag: '🇳🇱', fifaRanking: 6 },
    { name: 'Japan', country: 'Japan', flag: '🇯🇵', fifaRanking: 19 },
    { name: 'Sweden', country: 'Sweden', flag: '🇸🇪', fifaRanking: 23 },
    { name: 'Tunisia', country: 'Tunisia', flag: '🇹🇳', fifaRanking: 31 }
  ],
  G: [
    { name: 'Belgium', country: 'Belgium', flag: '🇧🇪', fifaRanking: 4 },
    { name: 'Egypt', country: 'Egypt', flag: '🇪🇬', fifaRanking: 39 },
    { name: 'Iran', country: 'Iran', flag: '🇮🇷', fifaRanking: 20 },
    { name: 'New Zealand', country: 'New Zealand', flag: '🇳🇿', fifaRanking: 94 }
  ],
  H: [
    { name: 'Spain', country: 'Spain', flag: '🇪🇸', fifaRanking: 8 },
    { name: 'Cabo Verde', country: 'Cabo Verde', flag: '🇨🇻', fifaRanking: 65 },
    { name: 'Saudi Arabia', country: 'Saudi Arabia', flag: '🇸🇦', fifaRanking: 54 },
    { name: 'Uruguay', country: 'Uruguay', flag: '🇺🇾', fifaRanking: 12 }
  ],
  I: [
    { name: 'France', country: 'France', flag: '🇫🇷', fifaRanking: 2 },
    { name: 'Senegal', country: 'Senegal', flag: '🇸🇳', fifaRanking: 18 },
    { name: 'Iraq', country: 'Iraq', flag: '🇮🇶', fifaRanking: 63 },
    { name: 'Norway', country: 'Norway', flag: '🇳🇴', fifaRanking: 46 }
  ],
  J: [
    { name: 'Argentina', country: 'Argentina', flag: '🇦🇷', fifaRanking: 1 },
    { name: 'Algeria', country: 'Algeria', flag: '🇩🇿', fifaRanking: 37 },
    { name: 'Austria', country: 'Austria', flag: '🇦🇹', fifaRanking: 22 },
    { name: 'Jordan', country: 'Jordan', flag: '🇯🇴', fifaRanking: 70 }
  ],
  K: [
    { name: 'Portugal', country: 'Portugal', flag: '🇵🇹', fifaRanking: 5 },
    { name: 'DR Congo', country: 'DR Congo', flag: '🇨🇩', fifaRanking: 67 },
    { name: 'Uzbekistan', country: 'Uzbekistan', flag: '🇺🇿', fifaRanking: 74 },
    { name: 'Colombia', country: 'Colombia', flag: '🇨🇴', fifaRanking: 10 }
  ],
  L: [
    { name: 'England', country: 'England', flag: '🏴', fifaRanking: 7 },
    { name: 'Croatia', country: 'Croatia', flag: '🇭🇷', fifaRanking: 9 },
    { name: 'Ghana', country: 'Ghana', flag: '🇬🇭', fifaRanking: 60 },
    { name: 'Panama', country: 'Panama', flag: '🇵🇦', fifaRanking: 45 }
  ]
};

const venues = [
  'MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'NRG Stadium', 'Hard Rock Stadium',
  'Mercedes-Benz Stadium', 'Lumen Field', "Levi's Stadium", 'Gillette Stadium',
  'Lincoln Financial Field', 'Arrowhead Stadium', 'BMO Field', 'BC Place',
  'Estadio Azteca', 'Estadio Akron', 'Estadio BBVA'
];
const cities = [
  'New York', 'Los Angeles', 'Dallas', 'Houston', 'Miami', 'Atlanta', 'Seattle',
  'San Francisco', 'Boston', 'Philadelphia', 'Kansas City', 'Toronto', 'Vancouver',
  'Mexico City', 'Guadalajara', 'Monterrey'
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Connected. Seeding database...');

  await Team.deleteMany({});
  await Match.deleteMany({});

  let matchNum = 1;

  for (const [group, groupTeams] of Object.entries(teamsData)) {
    const created = [];
    for (const data of groupTeams) {
      const team = await Team.create({ ...data, group });
      created.push(team);
    }

    for (let i = 0; i < created.length; i++) {
      for (let j = i + 1; j < created.length; j++) {
        const date = new Date(2026, 5, 11 + (matchNum % 16));
        date.setHours(12 + (matchNum % 9), (matchNum * 7) % 60);
        await Match.create({
          homeTeam: created[i]._id,
          awayTeam: created[j]._id,
          date,
          stage: 'Group Stage',
          group,
          venue: venues[matchNum % venues.length],
          city: cities[matchNum % cities.length],
          matchNumber: matchNum++
        });
      }
    }
  }

  const stages = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Bronze Final', 'Final'];
  const counts = [16, 8, 4, 2, 1, 1];
  const kDate = new Date(2026, 5, 28);

  for (let s = 0; s < stages.length; s++) {
    for (let i = 0; i < counts[s]; i++) {
      await Match.create({
        date: new Date(kDate),
        stage: stages[s],
        venue: venues[(s + i) % venues.length],
        city: cities[(s + i) % cities.length],
        matchNumber: matchNum++
      });
      kDate.setDate(kDate.getDate() + 1);
    }
    kDate.setDate(kDate.getDate() + 2);
  }

  const teamCount = await Team.countDocuments();
  const matchCount = await Match.countDocuments();
  logger.info(`Seed complete: ${teamCount} teams, ${matchCount} matches`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
