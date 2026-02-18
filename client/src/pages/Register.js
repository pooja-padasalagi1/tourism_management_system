import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../auth';

export default function Register(){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('user');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
      await register(name, email, password, role);
      nav('/dashboard');
    }catch(err){
      console.error('Register error', err);
      setError(err.response?.data?.error || err.message || 'Registration failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Create Account</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Register to access the dashboard</p>
        </div>
        <form onSubmit={handle}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input id="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" required />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>{loading ? '🔄 Creating...' : 'Create Account'}</button>
          {error && <div className="error" role="alert" aria-live="polite">⚠️ {error}</div>}
        </form>
      </div>
    </div>
  );
}
