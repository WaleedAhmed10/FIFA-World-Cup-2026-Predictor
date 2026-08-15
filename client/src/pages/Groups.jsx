import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import GroupStandings from '../components/GroupStandings';

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

const Groups = () => {
  const [standings, setStandings] = useState({});
  const [third, setThird] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/standings/groups'), api.get('/api/standings/best-third')])
      .then(([s, t]) => { setStandings(s.data.data); setThird(t.data.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Group Standings</h1>

      {third && (
        <div className="card mb-4 shadow">
          <div className="card-header bg-warning"><h5 className="mb-0">🏅 Best Third-Placed Teams (Top 8 Qualify)</h5></div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-success">✅ Qualified</h6>
                {third.qualified?.map((t) => <div key={t._id}>{t.flag} {t.name} ({t.group}) - {t.points} pts</div>)}
              </div>
              <div className="col-md-6">
                <h6 className="text-danger">❌ Eliminated</h6>
                {third.eliminated?.map((t) => <div key={t._id}>{t.flag} {t.name} ({t.group}) - {t.points} pts</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {GROUPS.map((g) => (
          <div key={g} className="col-lg-6 col-xl-4">
            <GroupStandings group={g} teams={standings[g] || []} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
