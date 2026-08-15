import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(form.username, form.email, form.password);
    setSubmitting(false);
    if (result.success) { toast.success('Registered!'); navigate('/'); }
    else { toast.error(result.error); }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-center mb-4">Register</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" className="form-control mb-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoComplete="username" />
            <input type="email" className="form-control mb-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
            <input type="password" className="form-control mb-3" placeholder="Password (min 8 chars, letters + numbers)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" />
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
