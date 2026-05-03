import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Tours from './pages/Tours';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import Travellers from './pages/Travellers';
import Reports from './pages/Reports';
import Search from './pages/Search';
import TourGuides from './pages/TourGuides';
import Map from './pages/Map';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import Enquiries from './pages/Enquiries';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { getToken } from './auth';
import Transport from './pages/Transport';
import Payments from './pages/Payments';
import TourPackages from './pages/TourPackages';

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
      <div className="main-layout">
        {token && <Sidebar />}
        <main className={`main-content ${!token ? 'no-sidebar' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
            <Route path="/tours" element={<PrivateRoute><Tours /></PrivateRoute>} />
            <Route path="/tour-guides" element={<PrivateRoute><TourGuides /></PrivateRoute>} />
            <Route path="/ratings" element={<PrivateRoute><Ratings /></PrivateRoute>} />
            <Route path="/enquiries" element={<PrivateRoute><Enquiries /></PrivateRoute>} />
            <Route path="/travellers" element={<PrivateRoute><Travellers /></PrivateRoute>} />
            <Route path="/map" element={<PrivateRoute><Map /></PrivateRoute>} />
            <Route path="/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />
            <Route path="/transport" element={<PrivateRoute><Transport /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            <Route path="/tour-packages" element={<PrivateRoute><TourPackages /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}
