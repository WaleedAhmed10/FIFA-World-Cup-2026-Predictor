import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseCsv } from '../utils/csv';

const DATASETS = [
  { key: 'groups', path: '/datasets/groups.csv' },
  { key: 'matches', path: '/datasets/matches.csv' },
  { key: 'knockout', path: '/datasets/knockout.csv' }
];

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState('A');

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(DATASETS.map(async ({ key, path }) => {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Could not load ${path} (HTTP ${response.status}).`);
      }

      const rows = parseCsv(await response.text());
      return [key, rows];
    }))
      .then((entries) => {
        const datasets = Object.fromEntries(entries);
        if (!datasets.groups.length || !datasets.matches.length || !datasets.knockout.length) {
          throw new Error('One or more tournament CSV files contain no data.');
        }
        setData(datasets);
      })
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') setError(loadError.message);
      });

    return () => controller.abort();
  }, []);

  const groups = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.groups.map((team) => team.group))].sort();
  }, [data]);

  const selectedTeams = useMemo(
    () => data?.groups.filter((team) => team.group === activeGroup) || [],
    [activeGroup, data]
  );
  const selectedMatches = useMemo(
    () => data?.matches.filter((match) => match.group === activeGroup) || [],
    [activeGroup, data]
  );
  const knockoutRounds = useMemo(() => {
    if (!data) return [];
    return data.knockout.reduce((rounds, match) => {
      const round = rounds.find((item) => item.name === match.round);
      if (round) round.matches.push(match);
      else rounds.push({ name: match.round, matches: [match] });
      return rounds;
    }, []);
  }, [data]);

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-eyebrow"><span className="home-eyebrow-dot" /> FIFA WORLD CUP 2026 / YOUR CALL</div>
          <h1>48 teams.<br />One <span>big idea.</span></h1>
          <p>Build your bracket, back your favorites, and see how your World Cup story unfolds.</p>
          <div className="home-hero-actions">
            <Link className="home-button home-button-light" to="/groups">Explore the groups <span aria-hidden="true">↗</span></Link>
            <Link className="home-text-link" to="/knockout">Jump to the bracket <span aria-hidden="true">→</span></Link>
          </div>
          <div className="home-hero-note"><span>USA</span><i /> <span>MEXICO</span><i /> <span>CANADA</span><b> / 2026</b></div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <div className="home-orbit home-orbit-one" />
          <div className="home-orbit home-orbit-two" />
          <div className="home-sun" />
          <div className="home-ball">⚽</div>
          <div className="home-hero-stamp">THE<br />26<br /><span>EDITION</span></div>
          <div className="home-hero-coordinate">34°42' N<br />118°15' W</div>
          <div className="home-hero-caption">A continent<br />in play.</div>
        </div>
        <div className="home-hero-index"><span>01</span> / THE ROAD TO 2026</div>
      </section>

      <section className="home-content">
        {error ? (
          <div className="home-data-error" role="alert">
            <strong>Tournament data couldn’t be loaded.</strong>
            <span>{error} Start or build the client with its npm scripts to sync the CSV datasets.</span>
          </div>
        ) : !data ? (
          <div className="home-data-loading" role="status">Loading the tournament datasets<span>…</span></div>
        ) : (
          <>
            <div className="home-stats" aria-label="Tournament data at a glance">
              <div><span>TEAMS IN THE DRAW</span><strong>{data.groups.length}<i> / 48</i></strong></div>
              <div><span>GROUP-STAGE FIXTURES</span><strong>{data.matches.length}<i> MATCHES</i></strong></div>
              <div><span>ROAD TO THE FINAL</span><strong>{data.knockout.length}<i> KNOCKOUTS</i></strong></div>
              <div className="home-stat-source"><span>THE SOURCE</span><strong>YOUR CSVs<i> / LIVE IN THE APP</i></strong></div>
            </div>

            <section className="home-draw-section" aria-labelledby="draw-heading">
              <div className="home-section-heading">
                <div>
                  <span className="home-kicker">01 — THE DRAW</span>
                  <h2 id="draw-heading">Pick a group.<br /><span>Feel the tension.</span></h2>
                </div>
                <p>All 48 nations, straight from the groups dataset. Find your side and make a plan.</p>
              </div>
              <div className="home-group-tabs" aria-label="Choose a World Cup group">
                {groups.map((group) => (
                  <button
                    type="button"
                    key={group}
                    className={group === activeGroup ? 'active' : ''}
                    aria-pressed={group === activeGroup}
                    onClick={() => setActiveGroup(group)}
                  >
                    {group}
                  </button>
                ))}
              </div>
              <div className="home-draw-grid">
                <div className="home-team-card">
                  <div className="home-card-topline"><span>GROUP {activeGroup}</span><span>{selectedTeams.length} NATIONS</span></div>
                  <div className="home-team-list">
                    {selectedTeams.map((team, index) => (
                      <div className="home-team-row" key={`${team.group}-${team.team}`}>
                        <span className="home-team-number">0{index + 1}</span>
                        <strong>{team.team}</strong>
                        <span className="home-confederation">{team.confederation}</span>
                      </div>
                    ))}
                  </div>
                  <Link className="home-card-link" to={`/groups?group=${activeGroup.toLowerCase()}`}>
                    Simulate group {activeGroup} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <div className="home-fixture-card">
                  <div className="home-card-topline"><span>THE FIXTURES</span><span>GROUP {activeGroup}</span></div>
                  {selectedMatches.map((match) => (
                    <div className="home-fixture-row" key={`${match.group}-${match.matchday}-${match.team1}-${match.team2}`}>
                      <div className="home-fixture-date"><strong>{match.date_et}</strong><span>MD {match.matchday}</span></div>
                      <div className="home-fixture-teams"><strong>{match.team1}</strong><span>vs</span><strong>{match.team2}</strong></div>
                      <div className="home-fixture-city">{match.venue_city}</div>
                    </div>
                  ))}
                  <Link className="home-card-link" to="/groups">
                    Enter your score predictions <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </section>

            <section className="home-knockout-section" aria-labelledby="knockout-heading">
              <div className="home-section-heading home-knockout-heading">
                <div>
                  <span className="home-kicker">02 — NO SECOND CHANCES</span>
                  <h2 id="knockout-heading">The long way<br />to <span>New York.</span></h2>
                </div>
                <Link className="home-button home-button-dark" to="/knockout">Build your bracket <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="home-rounds">
                {knockoutRounds.map((round, index) => (
                  <div className="home-round" key={round.name}>
                    <span className="home-round-index">0{index + 1}</span>
                    <strong>{round.name}</strong>
                    <span>{round.matches.length} {round.matches.length === 1 ? 'MATCH' : 'MATCHES'}</span>
                    <span className="home-round-arrow" aria-hidden="true">↗</span>
                  </div>
                ))}
              </div>
              <details className="home-full-schedule">
                <summary>Explore all {data.knockout.length} knockout fixtures <span aria-hidden="true">+</span></summary>
                <div className="home-schedule-list">
                  {data.knockout.map((match) => (
                    <div className="home-schedule-row" key={match.match_no}>
                      <span className="home-schedule-number">{match.match_no}</span>
                      <strong>{match.round}</strong>
                      <span>{match.team1_slot} <i>v</i> {match.team2_slot}</span>
                      <span>{match.date}</span>
                      <span>{match.city}</span>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            <footer className="home-footer">
              <span>ULTRAZONE / WORLD CUP 2026</span>
              <span>Good football. Better guesses.</span>
            </footer>
          </>
        )}
      </section>
    </main>
  );
};

export default Home;
