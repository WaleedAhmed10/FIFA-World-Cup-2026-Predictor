import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ALL_KO_MATCHES, GROUP_MATCHES, KO_ROUNDS } from '../data/tournament';
import {
  buildQualifiers,
  computeGroupStandings,
  parseScore,
  randomScore,
  rankingBasedScore,
  rankThirdPlaces,
  winnerOf,
  loserOf
} from '../utils/standings';

const GROUP_KEY = 'wc2026-group-scores';
const KO_KEY = 'wc2026-ko-scores';

const SimulatorContext = createContext(null);

const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const SimulatorProvider = ({ children }) => {
  const [groupScores, setGroupScores] = useState(() => load(GROUP_KEY));
  const [koScores, setKoScores] = useState(() => load(KO_KEY));
  const [useLocalTime, setUseLocalTime] = useState(false);

  const standings = useMemo(() => computeGroupStandings(groupScores), [groupScores]);
  const thirds = useMemo(() => rankThirdPlaces(standings), [standings]);
  const qualifiers = useMemo(() => buildQualifiers(standings), [standings]);

  const updateGroupScore = useCallback((matchId, side, value) => {
    setGroupScores((prev) => {
      const next = { ...prev, [matchId]: { ...(prev[matchId] || { h: '', a: '' }), [side]: value } };
      save(GROUP_KEY, next);
      return next;
    });
  }, []);

  const updateKoScore = useCallback((matchId, side, value) => {
    setKoScores((prev) => {
      const next = { ...prev, [matchId]: { ...(prev[matchId] || { h: '', a: '' }), [side]: value } };
      save(KO_KEY, next);
      return next;
    });
  }, []);

  const clearGroup = useCallback((group) => {
    setGroupScores((prev) => {
      const next = { ...prev };
      GROUP_MATCHES.filter((m) => !group || m.group === group).forEach((m) => {
        delete next[m.id];
      });
      save(GROUP_KEY, next);
      return next;
    });
  }, []);

  const fillGroup = useCallback((group, mode) => {
    setGroupScores((prev) => {
      const next = { ...prev };
      GROUP_MATCHES.filter((m) => !group || m.group === group).forEach((m) => {
        next[m.id] = mode === 'ranking'
          ? rankingBasedScore(m.homeId, m.awayId)
          : { h: String(randomScore()), a: String(randomScore()) };
      });
      save(GROUP_KEY, next);
      return next;
    });
  }, []);

  const knockoutMatches = useMemo(() => {
    const byId = {};
    KO_ROUNDS.forEach((round) => {
      round.matches.forEach((template) => {
        const match = { ...template, roundId: round.id, roundName: round.name, home: null, away: null };
        if (template.homeSlot) match.home = qualifiers[template.homeSlot] || null;
        if (template.awaySlot) match.away = qualifiers[template.awaySlot] || null;
        byId[match.id] = match;
      });
    });

    ALL_KO_MATCHES.forEach((template) => {
      const match = byId[template.id];
      if (template.homeFrom) {
        const prev = byId[template.homeFrom];
        match.home = template.useLoser ? loserOf(prev, koScores) : winnerOf(prev, koScores);
      }
      if (template.awayFrom) {
        const prev = byId[template.awayFrom];
        match.away = template.useLoser ? loserOf(prev, koScores) : winnerOf(prev, koScores);
      }
    });

    return byId;
  }, [qualifiers, koScores]);

  const fillKnockoutFromQualifiers = (mode, nextQualifiers, existingKo = {}) => {
    const next = { ...existingKo };
    const temp = {};
    KO_ROUNDS.forEach((round) => {
      round.matches.forEach((template) => {
        const match = { ...template, home: null, away: null };
        if (template.homeSlot) match.home = nextQualifiers[template.homeSlot] || null;
        if (template.awaySlot) match.away = nextQualifiers[template.awaySlot] || null;
        temp[match.id] = match;
      });
    });
    ALL_KO_MATCHES.forEach((template) => {
      const match = temp[template.id];
      if (template.homeFrom) {
        const prevMatch = temp[template.homeFrom];
        match.home = template.useLoser ? loserOf(prevMatch, next) : winnerOf(prevMatch, next);
      }
      if (template.awayFrom) {
        const prevMatch = temp[template.awayFrom];
        match.away = template.useLoser ? loserOf(prevMatch, next) : winnerOf(prevMatch, next);
      }
      if (match.home && match.away) {
        const existing = next[match.id];
        const hs = parseScore(existing?.h);
        const as = parseScore(existing?.a);
        if (hs === null || as === null || hs === as) {
          if (mode === 'ranking') {
            next[match.id] = rankingBasedScore(match.home.id, match.away.id);
          } else {
            let h = randomScore();
            let a = randomScore();
            if (h === a) h += 1;
            next[match.id] = { h: String(h), a: String(a) };
          }
        }
      }
      temp[template.id] = match;
    });
    return next;
  };

  const fillKnockout = useCallback((mode) => {
    setKoScores((prev) => {
      const next = fillKnockoutFromQualifiers(mode, qualifiers, prev);
      save(KO_KEY, next);
      return next;
    });
  }, [qualifiers]);

  const fillTournament = useCallback((mode) => {
    const nextGroups = {};
    GROUP_MATCHES.forEach((m) => {
      nextGroups[m.id] = mode === 'ranking'
        ? rankingBasedScore(m.homeId, m.awayId)
        : { h: String(randomScore()), a: String(randomScore()) };
    });
    const nextStandings = computeGroupStandings(nextGroups);
    const nextQualifiers = buildQualifiers(nextStandings);
    const nextKo = fillKnockoutFromQualifiers(mode, nextQualifiers, {});
    setGroupScores(nextGroups);
    setKoScores(nextKo);
    save(GROUP_KEY, nextGroups);
    save(KO_KEY, nextKo);
  }, []);

  const clearKnockout = useCallback(() => {
    setKoScores({});
    save(KO_KEY, {});
  }, []);

  const value = {
    groupScores,
    koScores,
    standings,
    thirds,
    qualifiers,
    knockoutMatches,
    useLocalTime,
    setUseLocalTime,
    updateGroupScore,
    updateKoScore,
    clearGroup,
    fillGroup,
    fillKnockout,
    fillTournament,
    clearKnockout
  };

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
};

export const useSimulator = () => {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used inside SimulatorProvider');
  return ctx;
};
