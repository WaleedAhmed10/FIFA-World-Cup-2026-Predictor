import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

// Admin-only screen for entering real match results. The backend independently
// re-checks req.user.role === 'admin' on every request — this page hiding the
// UI is a convenience, not the security boundary.
const Admin = () => {
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState({});

  const loadMatches = () => api.get('/api/matches').then((res) => setMatches(res.data.data)).catch(console.error);

  useEffect(() => { loadMatches(); }, []);

  const handleChange = (id, field, value) => {
    setScores((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const submitResult = async (match) => {
    const entry = scores[match._id];
    if (!entry || entry.homeScore === undefined || entry.awayScore === undefined) {
      toast.error('Enter both scores');
      return;
    }
    try {
      await api.put(`/api/matches/${match._id}`, {
        homeScore: parseInt(entry.homeScore, 10),
        awayScore: parseInt(entry.awayScore, 10),
        status: 'Completed'
      });
      toast.success('Result saved');
      loadMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save result');
    }
  };

  const scheduled = matches.filter((m) => m.status !== 'Completed');

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">⚙️ Admin: Enter Results</h1>
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Match</th><th>Stage</th><th style={{ width: 220 }}>Score</th><th></th></tr>
            </thead>
            <tbody>
              {scheduled.map((m) => (
                <tr key={m._id}>
                  <td>{m.homeTeam?.name || 'TBD'} vs {m.awayTeam?.name || 'TBD'}</td>
                  <td>{m.stage}</td>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      <input type="number" min="0" max="50" className="form-control form-control-sm" style={{ width: 70 }}
                        onChange={(e) => handleChange(m._id, 'homeScore', e.target.value)} />
                      <span>-</span>
                      <input type="number" min="0" max="50" className="form-control form-control-sm" style={{ width: 70 }}
                        onChange={(e) => handleChange(m._id, 'awayScore', e.target.value)} />
                    </div>
                  </td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => submitResult(m)}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
