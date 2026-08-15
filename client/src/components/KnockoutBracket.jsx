import React from 'react';

const STAGES = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Bronze Final', 'Final'];

const KnockoutBracket = ({ bracket }) => {
  if (!bracket) return null;

  return (
    <div>
      {STAGES.map((stage) => {
        const matches = bracket[stage] || [];
        if (!matches.length) return null;
        const isFinal = stage === 'Final';

        return (
          <div key={stage} className="mb-4">
            <h6 className="text-center mb-3">
              <span className={`badge ${isFinal ? 'bg-warning' : 'bg-primary'} p-2`}>
                {isFinal && '🏆 '}{stage}
              </span>
            </h6>
            <div className="row g-2">
              {matches.map((m) => (
                <div key={m._id} className="col-12 col-md-6 col-lg-4">
                  <div className={`card shadow-sm ${isFinal ? 'border-warning' : ''}`}>
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-end small">
                          <div>{m.homeTeam?.name || 'TBD'}</div>
                          <div>{m.homeTeam?.flag || ''}</div>
                        </div>
                        <div className="mx-2 fw-bold">
                          {m.status === 'Completed' ? `${m.homeScore}-${m.awayScore}` : 'vs'}
                        </div>
                        <div className="text-start small">
                          <div>{m.awayTeam?.flag || ''}</div>
                          <div>{m.awayTeam?.name || 'TBD'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KnockoutBracket;
