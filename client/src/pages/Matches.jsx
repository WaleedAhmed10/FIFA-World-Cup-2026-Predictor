import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const loadMatches = () => api.get('/api/matches').then((res) => setMatches(res.data.data)).catch(console.error);

  useEffect(() => { loadMatches(); }, []);

  const handlePredict = (match) => {
    if (!user) { toast.error('Please login first'); return; }
    const pred = match.predictions?.find((p) => p.user === user.id);
    setSelected(match);
    setHomeScore(pred?.homeScore?.toString() || '');
    setAwayScore(pred?.awayScore?.toString() || '');
    setShowModal(true);
  };

  const submitPrediction = async () => {
    if (homeScore === '' || awayScore === '') { toast.error('Enter both scores'); return; }
    if (Number(homeScore) < 0 || Number(awayScore) < 0) { toast.error('Scores cannot be negative'); return; }
    try {
      await api.post('/api/predictions', {
        matchId: selected._id,
        homeScore: parseInt(homeScore, 10),
        awayScore: parseInt(awayScore, 10)
      });
      toast.success('Prediction saved!');
      setShowModal(false);
      loadMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prediction');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Matches</h1>
      <div className="row">
        {matches.map((m) => (
          <div key={m._id} className="col-md-6 col-lg-4 mb-4">
            <MatchCard match={m} user={user} onPredict={handlePredict} />
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Make Prediction</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <h6>{selected?.homeTeam?.name} vs {selected?.awayTeam?.name}</h6>
                </div>
                <div className="row align-items-center">
                  <div className="col-5"><input type="number" className="form-control" min="0" max="20" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} placeholder="0" /></div>
                  <div className="col-2 text-center"><strong>vs</strong></div>
                  <div className="col-5"><input type="number" className="form-control" min="0" max="20" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} placeholder="0" /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitPrediction}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
