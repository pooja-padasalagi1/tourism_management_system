import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth';

export default function Login(){
  const [email,setEmail] = useState('admin@example.com');
  const [password,setPassword] = useState('password');
  const [error,setError] = useState('');
  const nav = useNavigate();
  const handle = async (e)=>{
    e.preventDefault();
    try{
      await login(email,password);
      nav('/dashboard');
    }catch(err){
      setError(err.response?.data?.error || 'Login failed');
    }
  };
  return (
    <div className="page login-page">
      <h2>Login</h2>
      <form onSubmit={handle} className="card">
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
