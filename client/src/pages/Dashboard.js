import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Spinner from '../components/Spinner';

const STAT_ICONS = {
  users:    { d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: '#3d8bcd' },
  hotels:   { d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: '#27ae60' },
  tours:    { d: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: '#c9a84c' },
  bookings: { d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#8b5cf6' },
};

function StatCard({ type, label, value, delay = 0 }) {
  const cfg = STAT_ICONS[type];
  return (
    <div
      className="card stat-card"
      style={{
        animation: `slideInUp 0.4s ease ${delay}s backwards`,
        borderLeft: `4px solid ${cfg.color}`,
        cursor: 'pointer',
      }}
    >
      <div className="card-header">
        <div className="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={cfg.d} />
          </svg>
        </div>
      </div>
      <div className="card-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  pending:   { bg: 'rgba(230,126,34,0.12)', text: '#e67e22', border: 'rgba(230,126,34,0.3)' },
  confirmed: { bg: 'rgba(39,174,96,0.12)',  text: '#27ae60', border: 'rgba(39,174,96,0.3)' },
  cancelled: { bg: 'rgba(192,57,43,0.12)',  text: '#c0392b', border: 'rgba(192,57,43,0.3)' },
  completed: { bg: 'rgba(61,90,128,0.15)',  text: '#7a9fc0', border: 'rgba(61,90,128,0.3)' },
};

export default function Dashboard() {
  const [counts, setCounts] = useState({ users: 0, hotels: 0, tours: 0, bookings: 0 });
  const [topHotels, setTopHotels] = useState([]);
  const [popularTours, setPopularTours] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [users, hotels, tours, bookings] = await Promise.all([
          api.get('/users').then(r => r.data).catch(() => []),
          api.get('/hotels').then(r => r.data).catch(() => []),
          api.get('/tours').then(r => r.data).catch(() => []),
          api.get('/bookings').then(r => r.data).catch(() => []),
        ]);
        setCounts({ users: users.length, hotels: hotels.length, tours: tours.length, bookings: bookings.length });
        setTopHotels([...hotels].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5));
        setPopularTours([...tours].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5));
        setRecentBookings(bookings.slice(0, 6));
      } catch(e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: '20px', color: '#3d5a70', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Loading Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your tourism platform overview</p>
        </div>
        <div className="flex-between gap-2">
          <button className="btn btn-primary" onClick={() => nav('/bookings')}>
            <span>📅</span> New Booking
          </button>
          <button className="btn btn-secondary" onClick={() => nav('/tours')}>
            <span>✈️</span> Add Tour
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4">
        <StatCard type="users"    label="Total Users"    value={counts.users}    delay={0.05} />
        <StatCard type="hotels"   label="Total Hotels"   value={counts.hotels}   delay={0.1} />
        <StatCard type="tours"    label="Total Tours"    value={counts.tours}    delay={0.15} />
        <StatCard type="bookings" label="Total Bookings" value={counts.bookings} delay={0.2} />
      </div>

      {/* Two-column layout */}
      <div className="grid-2">
        {/* Top Hotels */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏨 Top Rated Hotels</h3>
            <button onClick={() => nav('/hotels')} className="btn btn-outline btn-sm">
              View All
            </button>
          </div>
          <div className="card-body">
            {topHotels.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏨</div>
                <p className="empty-state-message">No hotels available yet</p>
              </div>
            ) : (
              <div className="gap-2" style={{ display: 'flex', flexDirection: 'column' }}>
                {topHotels.map((hotel, idx) => (
                  <div key={hotel.id} className="dashboard-list-item">
                    <div className="dashboard-list-rank">{idx + 1}</div>
                    <div className="dashboard-list-content">
                      <div className="dashboard-list-title">{hotel.name}</div>
                      <div className="dashboard-list-subtitle">{hotel.location}</div>
                    </div>
                    <div className="dashboard-list-badge">
                      <span>⭐ {Number(hotel.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Premium Tours */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">✈️ Premium Tours</h3>
            <button onClick={() => nav('/tours')} className="btn btn-outline btn-sm">
              View All
            </button>
          </div>
          <div className="card-body">
            {popularTours.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✈️</div>
                <p className="empty-state-message">No tours available yet</p>
              </div>
            ) : (
              <div className="gap-2" style={{ display: 'flex', flexDirection: 'column' }}>
                {popularTours.map((tour, idx) => (
                  <div key={tour.id} className="dashboard-list-item">
                    <div className="dashboard-list-rank dashboard-list-rank-success">{idx + 1}</div>
                    <div className="dashboard-list-content">
                      <div className="dashboard-list-title">{tour.title}</div>
                      {tour.description && <div className="dashboard-list-subtitle">{tour.description}</div>}
                    </div>
                    <div className="dashboard-list-badge dashboard-list-price">
                      ${Number(tour.price || 0).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Recent Bookings</h3>
          <button onClick={() => nav('/bookings')} className="btn btn-outline btn-sm">
            View All
          </button>
        </div>
        <div className="card-body">
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-message">No bookings yet</p>
            </div>
          ) : (
            <div className="grid-3">
              {recentBookings.map(b => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                return (
                  <div key={b.id} className="booking-card" style={{ padding: '1rem', borderRadius: '10px', background: sc.bg, border: `2px solid ${sc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>#{b.id} — {b.user_name || `User ${b.user_id}`}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>{b.tour_title || 'Tour'}</div>
                    </div>
                    <span style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: sc.text }}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
