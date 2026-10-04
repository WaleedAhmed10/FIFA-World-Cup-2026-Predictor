export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const TEAMS_BY_GROUP = {
  A: [
    { id: 'MEX', name: 'Mexico', flag: '🇲🇽', ranking: 15 },
    { id: 'RSA', name: 'South Africa', flag: '🇿🇦', ranking: 58 },
    { id: 'KOR', name: 'South Korea', flag: '🇰🇷', ranking: 28 },
    { id: 'CZE', name: 'Czechia', flag: '🇨🇿', ranking: 34 }
  ],
  B: [
    { id: 'CAN', name: 'Canada', flag: '🇨🇦', ranking: 41 },
    { id: 'BIH', name: 'Bosnia-Herzegovina', flag: '🇧🇦', ranking: 71 },
    { id: 'QAT', name: 'Qatar', flag: '🇶🇦', ranking: 50 },
    { id: 'SUI', name: 'Switzerland', flag: '🇨🇭', ranking: 14 }
  ],
  C: [
    { id: 'BRA', name: 'Brazil', flag: '🇧🇷', ranking: 3 },
    { id: 'MAR', name: 'Morocco', flag: '🇲🇦', ranking: 13 },
    { id: 'HAI', name: 'Haiti', flag: '🇭🇹', ranking: 87 },
    { id: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', ranking: 36 }
  ],
  D: [
    { id: 'USA', name: 'USA', flag: '🇺🇸', ranking: 16 },
    { id: 'PAR', name: 'Paraguay', flag: '🇵🇾', ranking: 53 },
    { id: 'AUS', name: 'Australia', flag: '🇦🇺', ranking: 27 },
    { id: 'TUR', name: 'Türkiye', flag: '🇹🇷', ranking: 40 }
  ],
  E: [
    { id: 'GER', name: 'Germany', flag: '🇩🇪', ranking: 11 },
    { id: 'CUW', name: 'Curaçao', flag: '🇨🇼', ranking: 86 },
    { id: 'CIV', name: 'Ivory Coast', flag: '🇨🇮', ranking: 49 },
    { id: 'ECU', name: 'Ecuador', flag: '🇪🇨', ranking: 32 }
  ],
  F: [
    { id: 'NED', name: 'Netherlands', flag: '🇳🇱', ranking: 6 },
    { id: 'JPN', name: 'Japan', flag: '🇯🇵', ranking: 19 },
    { id: 'SWE', name: 'Sweden', flag: '🇸🇪', ranking: 23 },
    { id: 'TUN', name: 'Tunisia', flag: '🇹🇳', ranking: 31 }
  ],
  G: [
    { id: 'BEL', name: 'Belgium', flag: '🇧🇪', ranking: 4 },
    { id: 'EGY', name: 'Egypt', flag: '🇪🇬', ranking: 39 },
    { id: 'IRN', name: 'Iran', flag: '🇮🇷', ranking: 20 },
    { id: 'NZL', name: 'New Zealand', flag: '🇳🇿', ranking: 94 }
  ],
  H: [
    { id: 'ESP', name: 'Spain', flag: '🇪🇸', ranking: 8 },
    { id: 'CPV', name: 'Cabo Verde', flag: '🇨🇻', ranking: 65 },
    { id: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', ranking: 54 },
    { id: 'URU', name: 'Uruguay', flag: '🇺🇾', ranking: 12 }
  ],
  I: [
    { id: 'FRA', name: 'France', flag: '🇫🇷', ranking: 2 },
    { id: 'SEN', name: 'Senegal', flag: '🇸🇳', ranking: 18 },
    { id: 'IRQ', name: 'Iraq', flag: '🇮🇶', ranking: 63 },
    { id: 'NOR', name: 'Norway', flag: '🇳🇴', ranking: 46 }
  ],
  J: [
    { id: 'ARG', name: 'Argentina', flag: '🇦🇷', ranking: 1 },
    { id: 'ALG', name: 'Algeria', flag: '🇩🇿', ranking: 37 },
    { id: 'AUT', name: 'Austria', flag: '🇦🇹', ranking: 22 },
    { id: 'JOR', name: 'Jordan', flag: '🇯🇴', ranking: 70 }
  ],
  K: [
    { id: 'POR', name: 'Portugal', flag: '🇵🇹', ranking: 5 },
    { id: 'COD', name: 'DR Congo', flag: '🇨🇩', ranking: 67 },
    { id: 'UZB', name: 'Uzbekistan', flag: '🇺🇿', ranking: 74 },
    { id: 'COL', name: 'Colombia', flag: '🇨🇴', ranking: 10 }
  ],
  L: [
    { id: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ranking: 7 },
    { id: 'CRO', name: 'Croatia', flag: '🇭🇷', ranking: 9 },
    { id: 'GHA', name: 'Ghana', flag: '🇬🇭', ranking: 60 },
    { id: 'PAN', name: 'Panama', flag: '🇵🇦', ranking: 45 }
  ]
};

export const TEAM_BY_ID = Object.values(TEAMS_BY_GROUP)
  .flat()
  .reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {});

const MATCHDAY_PAIRS = [
  [[0, 1], [2, 3]],
  [[3, 1], [0, 2]],
  [[3, 0], [1, 2]]
];

const MATCHDAY_DATES = {
  A: [['2026-06-11', '15:00'], ['2026-06-11', '18:00'], ['2026-06-17', '15:00'], ['2026-06-17', '18:00'], ['2026-06-24', '15:00'], ['2026-06-24', '18:00']],
  B: [['2026-06-12', '12:00'], ['2026-06-12', '15:00'], ['2026-06-18', '12:00'], ['2026-06-18', '15:00'], ['2026-06-24', '12:00'], ['2026-06-24', '21:00']],
  C: [['2026-06-13', '15:00'], ['2026-06-13', '18:00'], ['2026-06-19', '15:00'], ['2026-06-19', '17:30'], ['2026-06-24', '15:00'], ['2026-06-24', '15:00']],
  D: [['2026-06-12', '18:00'], ['2026-06-12', '21:00'], ['2026-06-18', '18:00'], ['2026-06-18', '21:00'], ['2026-06-25', '15:00'], ['2026-06-25', '18:00']],
  E: [['2026-06-14', '12:00'], ['2026-06-14', '15:00'], ['2026-06-20', '12:00'], ['2026-06-20', '15:00'], ['2026-06-25', '12:00'], ['2026-06-25', '21:00']],
  F: [['2026-06-14', '18:00'], ['2026-06-14', '21:00'], ['2026-06-20', '18:00'], ['2026-06-20', '21:00'], ['2026-06-26', '15:00'], ['2026-06-26', '18:00']],
  G: [['2026-06-15', '12:00'], ['2026-06-15', '15:00'], ['2026-06-21', '12:00'], ['2026-06-21', '15:00'], ['2026-06-26', '12:00'], ['2026-06-26', '21:00']],
  H: [['2026-06-15', '18:00'], ['2026-06-15', '21:00'], ['2026-06-21', '18:00'], ['2026-06-21', '21:00'], ['2026-06-27', '15:00'], ['2026-06-27', '18:00']],
  I: [['2026-06-16', '12:00'], ['2026-06-16', '15:00'], ['2026-06-22', '12:00'], ['2026-06-22', '15:00'], ['2026-06-27', '12:00'], ['2026-06-27', '21:00']],
  J: [['2026-06-16', '18:00'], ['2026-06-16', '21:00'], ['2026-06-22', '18:00'], ['2026-06-22', '21:00'], ['2026-06-27', '15:00'], ['2026-06-27', '18:00']],
  K: [['2026-06-17', '12:00'], ['2026-06-17', '21:00'], ['2026-06-23', '12:00'], ['2026-06-23', '15:00'], ['2026-06-26', '18:00'], ['2026-06-26', '21:00']],
  L: [['2026-06-13', '12:00'], ['2026-06-13', '21:00'], ['2026-06-19', '12:00'], ['2026-06-19', '21:00'], ['2026-06-25', '15:00'], ['2026-06-25', '18:00']]
};

export const GROUP_MATCHES = GROUP_LETTERS.flatMap((group) => {
  const teams = TEAMS_BY_GROUP[group];
  const dates = MATCHDAY_DATES[group];
  const matches = [];
  let n = 0;
  MATCHDAY_PAIRS.forEach((pairs, matchday) => {
    pairs.forEach(([hi, ai]) => {
      const [date, time] = dates[n];
      matches.push({
        id: `G-${group}-${n}`,
        group,
        matchday: matchday + 1,
        homeId: teams[hi].id,
        awayId: teams[ai].id,
        date,
        time
      });
      n += 1;
    });
  });
  return matches;
});

export const KO_ROUNDS = [
  {
    id: 'r32',
    name: 'Round of 32',
    matches: [
      { id: 'r32-1', date: '2026-06-28', time: '12:00', homeSlot: '1A', awaySlot: '2B' },
      { id: 'r32-2', date: '2026-06-28', time: '16:00', homeSlot: '1C', awaySlot: '2D' },
      { id: 'r32-3', date: '2026-06-29', time: '12:00', homeSlot: '1E', awaySlot: '2F' },
      { id: 'r32-4', date: '2026-06-29', time: '16:00', homeSlot: '1G', awaySlot: '2H' },
      { id: 'r32-5', date: '2026-06-30', time: '12:00', homeSlot: '1I', awaySlot: '2J' },
      { id: 'r32-6', date: '2026-06-30', time: '16:00', homeSlot: '1K', awaySlot: '2L' },
      { id: 'r32-7', date: '2026-07-01', time: '12:00', homeSlot: '1B', awaySlot: '2A' },
      { id: 'r32-8', date: '2026-07-01', time: '16:00', homeSlot: '1D', awaySlot: '2C' },
      { id: 'r32-9', date: '2026-07-02', time: '12:00', homeSlot: '1F', awaySlot: '3rd1' },
      { id: 'r32-10', date: '2026-07-02', time: '16:00', homeSlot: '1H', awaySlot: '3rd2' },
      { id: 'r32-11', date: '2026-07-03', time: '12:00', homeSlot: '1J', awaySlot: '3rd3' },
      { id: 'r32-12', date: '2026-07-03', time: '16:00', homeSlot: '1L', awaySlot: '3rd4' },
      { id: 'r32-13', date: '2026-07-04', time: '12:00', homeSlot: '2E', awaySlot: '3rd5' },
      { id: 'r32-14', date: '2026-07-04', time: '16:00', homeSlot: '2G', awaySlot: '3rd6' },
      { id: 'r32-15', date: '2026-07-05', time: '12:00', homeSlot: '2I', awaySlot: '3rd7' },
      { id: 'r32-16', date: '2026-07-05', time: '16:00', homeSlot: '2K', awaySlot: '3rd8' }
    ]
  },
  {
    id: 'r16',
    name: 'Round of 16',
    matches: [
      { id: 'r16-1', date: '2026-07-06', time: '12:00', homeFrom: 'r32-1', awayFrom: 'r32-2' },
      { id: 'r16-2', date: '2026-07-06', time: '16:00', homeFrom: 'r32-3', awayFrom: 'r32-4' },
      { id: 'r16-3', date: '2026-07-07', time: '12:00', homeFrom: 'r32-5', awayFrom: 'r32-6' },
      { id: 'r16-4', date: '2026-07-07', time: '16:00', homeFrom: 'r32-7', awayFrom: 'r32-8' },
      { id: 'r16-5', date: '2026-07-08', time: '12:00', homeFrom: 'r32-9', awayFrom: 'r32-10' },
      { id: 'r16-6', date: '2026-07-08', time: '16:00', homeFrom: 'r32-11', awayFrom: 'r32-12' },
      { id: 'r16-7', date: '2026-07-09', time: '12:00', homeFrom: 'r32-13', awayFrom: 'r32-14' },
      { id: 'r16-8', date: '2026-07-09', time: '16:00', homeFrom: 'r32-15', awayFrom: 'r32-16' }
    ]
  },
  {
    id: 'qf',
    name: 'Quarter-finals',
    matches: [
      { id: 'qf-1', date: '2026-07-11', time: '12:00', homeFrom: 'r16-1', awayFrom: 'r16-2' },
      { id: 'qf-2', date: '2026-07-11', time: '16:00', homeFrom: 'r16-3', awayFrom: 'r16-4' },
      { id: 'qf-3', date: '2026-07-12', time: '12:00', homeFrom: 'r16-5', awayFrom: 'r16-6' },
      { id: 'qf-4', date: '2026-07-12', time: '16:00', homeFrom: 'r16-7', awayFrom: 'r16-8' }
    ]
  },
  {
    id: 'sf',
    name: 'Semi-finals',
    matches: [
      { id: 'sf-1', date: '2026-07-14', time: '15:00', homeFrom: 'qf-1', awayFrom: 'qf-2' },
      { id: 'sf-2', date: '2026-07-15', time: '15:00', homeFrom: 'qf-3', awayFrom: 'qf-4' }
    ]
  },
  {
    id: 'third',
    name: 'Match for third place',
    matches: [
      { id: 'third', date: '2026-07-18', time: '15:00', homeFrom: 'sf-1', awayFrom: 'sf-2', useLoser: true }
    ]
  },
  {
    id: 'final',
    name: 'Final',
    matches: [
      { id: 'final', date: '2026-07-19', time: '15:00', homeFrom: 'sf-1', awayFrom: 'sf-2' }
    ]
  }
];

export const ALL_KO_MATCHES = KO_ROUNDS.flatMap((round) => round.matches);
