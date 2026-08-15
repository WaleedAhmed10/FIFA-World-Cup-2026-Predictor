import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/api/leaderboard').then((res) => setUsers(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🏆 Leaderboard</h1>
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead><tr><th>#</th><th>User</th><th className="text-end">Points</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.username}</td>
                  <td className="text-end fw-bold">{u.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
