import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Home = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/api/matches')
      .then((res) => {
        const m = res.data.data;
        setStats({ total: m.length, completed: m.filter((x) => x.status === 'Completed').length });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🏆 FIFA World Cup 2026 Predictor</h1>
      <p className="text-center lead">Predict match results and compete with others!</p>
      <div className="row mt-5">
        <div className="col-md-4"><div className="card text-center shadow"><div className="card-body"><h3>{stats.total || 0}</h3><p>Total Matches</p></div></div></div>
        <div className="col-md-4"><div className="card text-center shadow"><div className="card-body"><h3>{stats.completed || 0}</h3><p>Completed</p></div></div></div>
        <div className="col-md-4"><div className="card text-center shadow"><div className="card-body"><h3>{(stats.total || 0) - (stats.completed || 0)}</h3><p>Remaining</p></div></div></div>
      </div>
      <div className="card mt-4 shadow">
        <div className="card-body">
          <h5>How to Play</h5>
          <ol>
            <li>Create an account</li>
            <li>Predict scores for matches</li>
            <li>Earn points for correct predictions (3 for exact score, 1 for correct result)</li>
            <li>Check the leaderboard!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
