import React from 'react';

const GroupStandings = ({ group, teams }) => {
  if (!teams || !teams.length) return null;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Group {group}</h5>
      </div>
      <div className="card-body p-0">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr key={t._id} className={i < 2 ? 'table-success' : i === 2 ? 'table-warning' : ''}>
                <td>{i + 1}</td>
                <td><span className="me-1">{t.flag}</span>{t.name}</td>
                <td className="text-center">{t.played}</td>
                <td className="text-center">{t.won}</td>
                <td className="text-center">{t.drawn}</td>
                <td className="text-center">{t.lost}</td>
                <td className="text-center">{t.goalsFor}</td>
                <td className="text-center">{t.goalsAgainst}</td>
                <td className="text-center">{t.goalDifference}</td>
                <td className="text-center fw-bold">{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupStandings;
