import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Tours from './pages/Tours';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Search from './pages/Search';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { getToken } from './auth';

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    function onAuth() { setToken(getToken()); }
    window.addEventListener('tms_auth_changed', onAuth);
    return () => window.removeEventListener('tms_auth_changed', onAuth);
  }, []);

  return (
    <div className="app-root">
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        {token && <Sidebar />}
        <main className="container" style={{ marginLeft: token ? '260px' : '0' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
            <Route path="/tours" element={<PrivateRoute><Tours /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}
