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
    try {
      await register(name, email, password, role);
      nav('/dashboard');
    } catch(err) {
      console.error('Register error', err);
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a8872e 0%, #c9a84c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(201,168,76,0.3)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontFamily: "'Barlow', sans-serif", fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c' }}>
            Create Account
          </h2>
          <p style={{ color: '#3d5a70', margin: 0, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
            Register to access the dashboard
          </p>
        </div>

        <form onSubmit={handle}>
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="name">Full Name</label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          {error && <div className="error" role="alert">{error}</div>}
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(61,90,128,0.3)' }}>
          <span style={{ color: '#3d5a70', fontSize: '13px' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#c9a84c', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
