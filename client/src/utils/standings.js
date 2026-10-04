import { GROUP_LETTERS, GROUP_MATCHES, TEAM_BY_ID, TEAMS_BY_GROUP } from '../data/tournament';

export const emptyScore = () => ({ h: '', a: '' });

export const parseScore = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

const blankRow = (team, group) => ({
  ...team,
  group,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  gf: 0,
  ga: 0,
  gd: 0,
  pts: 0
});

const applyResult = (home, away, hs, as) => {
  home.played += 1;
  away.played += 1;
  home.gf += hs;
  home.ga += as;
  away.gf += as;
  away.ga += hs;
  home.gd = home.gf - home.ga;
  away.gd = away.gf - away.ga;
  if (hs > as) {
    home.won += 1;
    home.pts += 3;
    away.lost += 1;
  } else if (hs < as) {
    away.won += 1;
    away.pts += 3;
    home.lost += 1;
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.pts += 1;
    away.pts += 1;
  }
};

const compareTeams = (a, b) =>
  b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name);

export function computeGroupStandings(groupScores) {
  const standings = {};
  GROUP_LETTERS.forEach((group) => {
    const rows = {};
    TEAMS_BY_GROUP[group].forEach((team) => {
      rows[team.id] = blankRow(team, group);
    });
    GROUP_MATCHES.filter((m) => m.group === group).forEach((m) => {
      const s = groupScores[m.id];
      const hs = parseScore(s?.h);
      const as = parseScore(s?.a);
      if (hs === null || as === null) return;
      applyResult(rows[m.homeId], rows[m.awayId], hs, as);
    });
    standings[group] = Object.values(rows).sort(compareTeams);
  });
  return standings;
}

export function rankThirdPlaces(standings) {
  const thirds = GROUP_LETTERS
    .map((group) => standings[group]?.[2])
    .filter(Boolean)
    .sort(compareTeams);
  return {
    all: thirds,
    qualified: thirds.slice(0, 8),
    eliminated: thirds.slice(8)
  };
}

export function buildQualifiers(standings) {
  const q = {};
  GROUP_LETTERS.forEach((group) => {
    const table = standings[group] || [];
    if (table[0]) q[`1${group}`] = table[0];
    if (table[1]) q[`2${group}`] = table[1];
  });
  rankThirdPlaces(standings).qualified.forEach((team, i) => {
    q[`3rd${i + 1}`] = team;
  });
  return q;
}

export function winnerOf(match, scores) {
  const hs = parseScore(scores[match.id]?.h);
  const as = parseScore(scores[match.id]?.a);
  if (hs === null || as === null || !match.home || !match.away) return null;
  if (hs > as) return match.home;
  if (as > hs) return match.away;
  return null;
}

export function loserOf(match, scores) {
  const hs = parseScore(scores[match.id]?.h);
  const as = parseScore(scores[match.id]?.a);
  if (hs === null || as === null || !match.home || !match.away) return null;
  if (hs > as) return match.away;
  if (as > hs) return match.home;
  return null;
}

export function resolveTeamFromSlot(slot, qualifiers) {
  return qualifiers[slot] || null;
}

export function randomScore(max = 4) {
  return Math.floor(Math.random() * (max + 1));
}

export function rankingBasedScore(homeId, awayId) {
  const home = TEAM_BY_ID[homeId];
  const away = TEAM_BY_ID[awayId];
  const hr = home?.ranking ?? 50;
  const ar = away?.ranking ?? 50;
  const homeGoals = Math.max(0, Math.round((ar - hr) / 25 + 1.2 + Math.random()));
  const awayGoals = Math.max(0, Math.round((hr - ar) / 25 + 0.8 + Math.random()));
  return { h: String(Math.min(homeGoals, 5)), a: String(Math.min(awayGoals, 5)) };
}

export function formatMatchDate(date, time, useLocal) {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '15:00').split(':').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh + 5, mm));
  if (useLocal) {
    return dt.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return `${m}/${d}/${y} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
