import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch(err) {
      console.error('Login error', err);
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a8872e 0%, #c9a84c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 8px 24px rgba(201,168,76,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontFamily: "'Barlow', sans-serif", fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c' }}>
            TMS Pro
          </h2>
          <p style={{ color: '#3d5a70', margin: 0, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
            Tourism Management System
          </p>
        </div>

        <form onSubmit={handle}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          {error && <div className="error" role="alert">{error}</div>}
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(61,90,128,0.3)' }}>
          <span style={{ color: '#3d5a70', fontSize: '13px' }}>No account? </span>
          <Link to="/register" style={{ color: '#c9a84c', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
