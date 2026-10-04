import React from 'react';
import { KO_ROUNDS } from '../data/tournament';
import { useSimulator } from '../context/SimulatorContext';
import { formatMatchDate, parseScore } from '../utils/standings';

const ScoreBox = ({ match, scores, onChange, disabled, useLocalTime }) => {
  const score = scores[match.id] || { h: '', a: '' };
  const hs = parseScore(score.h);
  const as = parseScore(score.a);
  const homeWin = hs !== null && as !== null && hs > as;
  const awayWin = hs !== null && as !== null && as > hs;

  return (
    <div className={`ko-match ${match.id === 'final' ? 'final' : ''} ${match.id === 'third' ? 'third' : ''}`}>
      <div className="ko-when">{formatMatchDate(match.date, match.time, useLocalTime).replace(/,?\s?\d{4}/, '')}</div>
      <div className="ko-row">
        <span className={`ko-team ${homeWin ? 'winner' : ''}`}>
          {match.home ? (
            <>
              <span className="ko-flag">{match.home.flag}</span>
              <span>{match.home.name.toUpperCase()}</span>
            </>
          ) : <span className="ko-tbd">TBD</span>}
        </span>
        <input
          className="ko-score"
          type="number"
          min="0"
          max="20"
          disabled={disabled || !match.home || !match.away}
          value={score.h}
          onChange={(e) => onChange(match.id, 'h', e.target.value)}
        />
        <input
          className="ko-score"
          type="number"
          min="0"
          max="20"
          disabled={disabled || !match.home || !match.away}
          value={score.a}
          onChange={(e) => onChange(match.id, 'a', e.target.value)}
        />
        <span className={`ko-team right ${awayWin ? 'winner' : ''}`}>
          {match.away ? (
            <>
              <span>{match.away.name.toUpperCase()}</span>
              <span className="ko-flag">{match.away.flag}</span>
            </>
          ) : <span className="ko-tbd">TBD</span>}
        </span>
      </div>
      {match.id === 'final' && <div className="ko-label">Final</div>}
      {match.id === 'third' && <div className="ko-label light">Match for third place</div>}
    </div>
  );
};

const Knockout = () => {
  const {
    knockoutMatches,
    koScores,
    updateKoScore,
    fillKnockout,
    fillTournament,
    clearKnockout,
    useLocalTime,
    setUseLocalTime
  } = useSimulator();

  return (
    <div className="uz-page ko-page">
      <div className="uz-wrap wide">
        <nav className="uz-crumb">
          ULTRAZONE <span>›</span> Football <span>›</span> FIFA World Cup
        </nav>
        <h1>2026 FIFA World Cup Knockout Stage</h1>
        <p className="uz-lead">
          Winners from the group simulator fill the bracket. Enter scores to advance teams.
          Draws do not advance a side — give one team an extra goal (extra time / penalties).
        </p>

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
            <button type="button" onClick={() => fillTournament('ranking')}>RESULTS</button>
            <button type="button" onClick={() => fillKnockout('random')}>AUTO</button>
            <button type="button" onClick={clearKnockout}>CLEAR</button>
          </div>
        </div>

        <div className="ko-bracket">
          {KO_ROUNDS.map((round) => (
            <div key={round.id} className={`ko-round ko-${round.id}`}>
              {round.matches.map((template) => {
                const match = knockoutMatches[template.id];
                return (
                  <ScoreBox
                    key={template.id}
                    match={match}
                    scores={koScores}
                    onChange={updateKoScore}
                    disabled={false}
                    useLocalTime={useLocalTime}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Knockout;
