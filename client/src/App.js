import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Tours from './pages/Tours';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Header from './components/Header';
import Footer from './components/Footer';
import { getToken } from './auth';

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
          <Route path="/tours" element={<PrivateRoute><Tours /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
