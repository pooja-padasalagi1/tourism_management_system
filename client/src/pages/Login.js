import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth';

export default function Login(){
  const [email,setEmail] = useState('admin@example.com');
  const [password,setPassword] = useState('password');
  const [error,setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const handle = async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      await login(email,password);
      nav('/dashboard');
    }catch(err){
      console.error('Login error', err);
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page login-page">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌍</div>
          <h2 style={{ margin: '0 0 8px 0' }}>Welcome Back</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Tourism Management System</p>
        </div>
        <form onSubmit={handle}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? '🔄 Signing in...' : '🚀 Sign In'}
          </button>
          {error && <div className="error" role="alert" aria-live="polite">⚠️ {error}</div>}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button type="button" onClick={()=>nav('/register')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Create an account</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '13px' }}>
            <p>Demo Credentials:</p>
            <p>Email: admin@example.com</p>
            <p>Password: password</p>
          </div>
        </form>
      </div>
    </div>
  );
}
