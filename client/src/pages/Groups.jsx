import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GROUP_LETTERS, GROUP_MATCHES, TEAM_BY_ID } from '../data/tournament';
import { useSimulator } from '../context/SimulatorContext';
import { formatMatchDate } from '../utils/standings';

const Groups = () => {
  const [params, setParams] = useSearchParams();
  const group = (params.get('group') || 'A').toUpperCase();
  const active = GROUP_LETTERS.includes(group) ? group : 'A';
  const {
    standings,
    thirds,
    groupScores,
    updateGroupScore,
    fillGroup,
    clearGroup,
    useLocalTime,
    setUseLocalTime
  } = useSimulator();

  const table = standings[active] || [];
  const matches = useMemo(
    () => GROUP_MATCHES.filter((m) => m.group === active),
    [active]
  );
  const matchdays = [1, 2, 3].map((day) => matches.filter((m) => m.matchday === day));
  const qualifiedIds = new Set(
    (thirds.qualified || []).map((t) => t.id)
  );

  const setGroup = (letter) => {
    setParams({ group: letter.toLowerCase() });
  };

  return (
    <div className="uz-page">
      <div className="uz-wrap">
        <nav className="uz-crumb">
          ULTRAZONE <span>›</span> Football <span>›</span> FIFA World Cup
        </nav>
        <div className="uz-title-row">
          <div>
            <h1>2026 FIFA World Cup Group Stage Points Simulator</h1>
            <p>
              Calculate the standings and points if you enter the score of the game.
              The score is automatically saved on the browser.
            </p>
          </div>
          <div className="uz-date">2026-06-11</div>
        </div>

        <div className="uz-group-tabs">
          {GROUP_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              className={letter === active ? 'active' : ''}
              onClick={() => setGroup(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="uz-group-layout">
          <div className="uz-table-block">
            <table className="uz-table">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  <th>Pts</th>
                  <th>MP</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                {table.map((team, i) => {
                  const isTop2 = i < 2 && team.played > 0;
                  const isBestThird = i === 2 && qualifiedIds.has(team.id) && team.played > 0;
                  return (
                    <tr key={team.id}>
                      <td>
                        {(isTop2 || isBestThird) && <span className="uz-qualify">QUALIFY</span>}
                      </td>
                      <td className="uz-team">
                        <span className="uz-flag">{team.flag}</span>
                        {team.name}
                      </td>
                      <td className="fw">{team.pts}</td>
                      <td>{team.played}</td>
                      <td>{team.won}</td>
                      <td>{team.drawn}</td>
                      <td>{team.lost}</td>
                      <td>{team.gf}</td>
                      <td>{team.ga}</td>
                      <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="uz-toolbar">
          <label className="uz-radio">
            <input type="radio" checked={!useLocalTime} onChange={() => setUseLocalTime(false)} />
            your time zone
          </label>
          <label className="uz-radio">
            <input type="radio" checked={useLocalTime} onChange={() => setUseLocalTime(true)} />
            local time
          </label>
          <div className="uz-actions">
            <button type="button" onClick={() => fillGroup(active, 'ranking')}>RESULTS</button>
            <button type="button" onClick={() => fillGroup(active, 'random')}>AUTO</button>
            <button type="button" onClick={() => clearGroup(active)}>CLEAR</button>
          </div>
        </div>

        <div className="uz-fixtures">
          {matchdays.map((dayMatches, idx) => (
            <div key={idx} className="uz-matchday">
              <div className="uz-md-num">{idx + 1}</div>
              <div className="uz-md-list">
                {dayMatches.map((m) => {
                  const home = TEAM_BY_ID[m.homeId];
                  const away = TEAM_BY_ID[m.awayId];
                  const score = groupScores[m.id] || { h: '', a: '' };
                  return (
                    <div key={m.id} className="uz-fixture">
                      <div className="uz-when">{formatMatchDate(m.date, m.time, useLocalTime)}</div>
                      <div className="uz-fixture-teams">
                        <div className="uz-side right">
                          <span className="name">{home.name.toUpperCase()}</span>
                          <span className="uz-flag">{home.flag}</span>
                        </div>
                        <input
                          className="uz-score"
                          type="number"
                          min="0"
                          max="20"
                          value={score.h}
                          onChange={(e) => updateGroupScore(m.id, 'h', e.target.value)}
                        />
                        <input
                          className="uz-score"
                          type="number"
                          min="0"
                          max="20"
                          value={score.a}
                          onChange={(e) => updateGroupScore(m.id, 'a', e.target.value)}
                        />
                        <div className="uz-side left">
                          <span className="uz-flag">{away.flag}</span>
                          <span className="name">{away.name.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <h2 className="uz-section-title">Ranking of Third-placed teams</h2>
        <table className="uz-table uz-third">
          <thead>
            <tr>
              <th></th>
              <th>Team</th>
              <th>Pts</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>+/-</th>
            </tr>
          </thead>
          <tbody>
            {thirds.all.map((team, i) => (
              <tr key={team.id}>
                <td>{i < 8 && team.played > 0 && <span className="uz-qualify">QUALIFY</span>}</td>
                <td className="uz-team">
                  <span className="uz-flag">{team.flag}</span>
                  {team.name} <span className="muted">({team.group})</span>
                </td>
                <td className="fw">{team.pts}</td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.drawn}</td>
                <td>{team.lost}</td>
                <td>{team.gf}</td>
                <td>{team.ga}</td>
                <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Groups;
