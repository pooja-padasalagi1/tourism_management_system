import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-section">
          <div className="auth-logo">✈️</div>
          <h1 className="auth-brand">TMS Pro</h1>
          <p className="auth-subtitle">Tourism Management System</p>
        </div>

        <form className="auth-form" onSubmit={handle}>
          <div>
            <h2 className="auth-title">Create account</h2>
            <p className="auth-description">Join TMS Pro to manage your tourism platform</p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required autoFocus />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
