import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me').then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">⚽ WC 2026</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
            <li className="nav-item"><Link to="/groups" className="nav-link">Groups</Link></li>
            <li className="nav-item"><Link to="/matches" className="nav-link">Matches</Link></li>
            <li className="nav-item"><Link to="/knockout" className="nav-link">Knockout</Link></li>
            {user && <li className="nav-item"><Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link></li>}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item"><span className="nav-link">⭐ {user.totalPoints || 0} pts</span></li>
                <li className="nav-item"><button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
                <li className="nav-item"><Link to="/register" className="nav-link">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Group Standings Component
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
                <td>{i+1}</td>
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

const MatchCard = ({ match, user, onPredict }) => {
  const userPrediction = match.predictions?.find(p => p.user === user?.id);
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
              <div>{match.homeTeam?.name}</div>
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
              <div>{match.awayTeam?.name}</div>
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

const KnockoutBracket = ({ bracket }) => {
  if (!bracket) return null;
  
  const stages = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Bronze Final', 'Final'];
  
  return (
    <div>
      {stages.map((stage, idx) => {
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
              {matches.map(m => (
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

const Home = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('/api/matches').then(res => {
      const m = res.data;
      setStats({ total: m.length, completed: m.filter(x => x.status === 'Completed').length });
    }).catch(console.error);
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
      <div className="card mt-4 shadow"><div className="card-body"><h5>How to Play</h5><ol><li>Create an account</li><li>Predict scores for matches</li><li>Earn points for correct predictions</li><li>Check the leaderboard!</li></ol></div></div>
    </div>
  );
};

const Groups = () => {
  const [standings, setStandings] = useState({});
  const [third, setThird] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/standings/groups'), axios.get('/api/standings/best-third')])
      .then(([s, t]) => { setStandings(s.data); setThird(t.data); setLoading(false); })
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
                {third.qualified?.map(t => <div key={t._id}>{t.flag} {t.name} ({t.group}) - {t.points} pts</div>)}
              </div>
              <div className="col-md-6">
                <h6 className="text-danger">❌ Eliminated</h6>
                {third.eliminated?.map(t => <div key={t._id}>{t.flag} {t.name} ({t.group}) - {t.points} pts</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
          <div key={g} className="col-lg-6 col-xl-4">
            <GroupStandings group={g} teams={standings[g] || []} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    axios.get('/api/matches').then(res => setMatches(res.data)).catch(console.error);
  }, []);

  const handlePredict = (match) => {
    if (!user) { toast.error('Please login first'); return; }
    const pred = match.predictions?.find(p => p.user === user.id);
    setSelected(match);
    setHomeScore(pred?.homeScore?.toString() || '');
    setAwayScore(pred?.awayScore?.toString() || '');
    setShowModal(true);
  };

  const submitPrediction = async () => {
    if (!homeScore || !awayScore) { toast.error('Enter both scores'); return; }
    try {
      await axios.post('/api/predictions', { matchId: selected._id, homeScore: parseInt(homeScore), awayScore: parseInt(awayScore) });
      toast.success('Prediction saved!');
      setShowModal(false);
      const res = await axios.get('/api/matches');
      setMatches(res.data);
    } catch (err) {
      toast.error('Failed to save prediction');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Matches</h1>
      <div className="row">
        {matches.map(m => (
          <div key={m._id} className="col-md-6 col-lg-4 mb-4">
            <MatchCard match={m} user={user} onPredict={handlePredict} />
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                  <div className="col-5"><input type="number" className="form-control" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} placeholder="0" /></div>
                  <div className="col-2 text-center"><strong>vs</strong></div>
                  <div className="col-5"><input type="number" className="form-control" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} placeholder="0" /></div>
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

const Knockout = () => {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get('/api/standings/knockout-bracket').then(res => {
      setBracket(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🏆 Knockout Stage</h1>
      <KnockoutBracket bracket={bracket} />
    </div>
  );
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/leaderboard').then(res => setUsers(res.data)).catch(console.error);
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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.username, form.password);
    if (result.success) { toast.success('Logged in!'); navigate('/'); } 
    else { toast.error(result.error); }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-center mb-4">Login</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" className="form-control mb-3" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            <input type="password" className="form-control mb-3" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          <div className="text-center mt-3">
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.username, form.email, form.password);
    if (result.success) { toast.success('Registered!'); navigate('/'); } 
    else { toast.error(result.error); }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-center mb-4">Register</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" className="form-control mb-3" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            <input type="email" className="form-control mb-3" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <input type="password" className="form-control mb-3" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="submit" className="btn btn-primary w-100">Register</button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Toaster position="top-right" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/knockout" element={<Knockout />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <style>{`
            body { background: #f8f9fa; }
            .card { border: none; border-radius: 12px; transition: all 0.3s; }
            .card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important; }
            .navbar { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .table-success { background-color: #d4edda !important; }
            .table-warning { background-color: #fff3cd !important; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050; overflow: auto; display: flex; align-items: center; justify-content: center; }
          `}</style>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;