import React, { useState, useEffect } from 'react';
import api from '../api';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

export default function Overview() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [hotelsRes, toursRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/hotels'),
        api.get('/tours'),
        api.get('/bookings'),
        api.get('/users')
      ]);

      setStats({
        hotels: hotelsRes.data?.length || 0,
        tours: toursRes.data?.length || 0,
        bookings: bookingsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        totalRevenue: bookingsRes.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
      });
    } catch (err) {
      console.error('Failed to load overview stats', err);
      setToast({ type: 'error', message: 'Failed to load overview data' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">Comprehensive view of your tourism management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏨</div>
          <div className="stat-content">
            <div className="stat-number">{stats.hotels}</div>
            <div className="stat-label">Total Hotels</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.tours}</div>
            <div className="stat-label">Total Tours</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.bookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">${stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="overview-content">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => window.location.href = '/hotels'}>
              Manage Hotels
            </button>
            <button className="btn btn-primary" onClick={() => window.location.href = '/tours'}>
              Manage Tours
            </button>
            <button className="btn btn-primary" onClick={() => window.location.href = '/bookings'}>
              View Bookings
            </button>
            <button className="btn btn-primary" onClick={() => window.location.href = '/reports'}>
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}