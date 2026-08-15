import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(form.username, form.password);
    setSubmitting(false);
    if (result.success) { toast.success('Logged in!'); navigate('/'); }
    else { toast.error(result.error); }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-center mb-4">Login</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" className="form-control mb-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoComplete="username" />
            <input type="password" className="form-control mb-3" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>
          </form>
          <div className="text-center mt-3">
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
