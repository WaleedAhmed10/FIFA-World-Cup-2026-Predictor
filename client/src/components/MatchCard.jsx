import React from 'react';

const MatchCard = ({ match, user, onPredict }) => {
  const userPrediction = match.predictions?.find((p) => p.user === user?.id);

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <span className={`badge bg-${match.status === 'Completed' ? 'success' : match.status === 'Live' ? 'danger' : 'secondary'}`}>
            {match.status}
          </span>
          <small className="text-muted">{match.stage}{match.group && ` - Group ${match.group}`}</small>
        </div>
        <div className="text-center py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-end">
              <div>{match.homeTeam?.name || 'TBD'}</div>
              <div className="fs-1">{match.homeTeam?.flag}</div>
            </div>
            <div className="mx-3">
              {match.status === 'Completed' ? (
                <h3 className="mb-0">{match.homeScore} - {match.awayScore}</h3>
              ) : (
                <h5 className="mb-0">vs</h5>
              )}
            </div>
            <div className="text-start">
              <div className="fs-1">{match.awayTeam?.flag}</div>
              <div>{match.awayTeam?.name || 'TBD'}</div>
            </div>
          </div>
          {match.status === 'Scheduled' && (
            <div className="mt-2">
              <button className="btn btn-primary btn-sm" onClick={() => onPredict(match)}>
                {userPrediction ? 'Update' : 'Predict'}
              </button>
              {userPrediction && (
                <span className="badge bg-info ms-2">Your: {userPrediction.homeScore}-{userPrediction.awayScore}</span>
              )}
            </div>
          )}
          {match.status === 'Completed' && (
            <div className="mt-2">
              <small className="text-muted">{new Date(match.date).toLocaleDateString()}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
