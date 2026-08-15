import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import KnockoutBracket from '../components/KnockoutBracket';

const Knockout = () => {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/standings/knockout-bracket')
      .then((res) => { setBracket(res.data.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🏆 Knockout Stage</h1>
      <KnockoutBracket bracket={bracket} />
    </div>
  );
};

export default Knockout;
