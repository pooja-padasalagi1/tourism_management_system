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
      className="card-professional hover-lift"
      style={{
        animation: `slideInUp 0.4s ease ${delay}s backwards`,
        borderLeft: `4px solid ${cfg.color}`,
        cursor: 'pointer',
      }}
    >
      <div className="card-header-professional">
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
          border: `2px solid ${cfg.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={cfg.d} />
          </svg>
        </div>
      </div>
      <div className="card-body-professional">
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#2d3748', fontFamily: "'Barlow', sans-serif", lineHeight: 1, marginBottom: '8px' }} className="text-gradient">{value}</div>
        <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
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
      <div className="spacing-section">
        <div className="spacing-container">
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="text-gradient font-display" style={{ margin: 0, fontSize: '36px' }}>Dashboard</h2>
              <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '16px', letterSpacing: '0.5px', fontWeight: 500 }}>
                Overview of your tourism platform
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-ripple" onClick={() => nav('/bookings')} style={{ padding: '12px 20px', fontSize: '13px' }}>New Booking</button>
              <button className="btn btn-success btn-ripple" onClick={() => nav('/tours')} style={{ padding: '12px 20px', fontSize: '13px' }}>Add Tour</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="spacing-grid">
        <StatCard type="users"    label="Total Users"    value={counts.users}    delay={0.05} />
        <StatCard type="hotels"   label="Total Hotels"   value={counts.hotels}   delay={0.1} />
        <StatCard type="tours"    label="Total Tours"    value={counts.tours}    delay={0.15} />
        <StatCard type="bookings" label="Total Bookings" value={counts.bookings} delay={0.2} />
      </div>

      {/* Two-column layout */}
      <div className="spacing-grid" style={{ marginBottom: '32px' }}>
        {/* Top Hotels */}
        <div className="card-professional">
          <div className="card-header-professional">
            <h3 className="card-title-professional">Top Rated Hotels</h3>
            <button onClick={() => nav('/hotels')} className="btn btn-outline btn-ripple" style={{ padding: '6px 12px', fontSize: '10px' }}>
              View All
            </button>
          </div>
          <div className="card-body-professional">
            {topHotels.length === 0 ? (
              <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No hotels yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topHotels.map((hotel, idx) => (
                  <div key={hotel.id} className="interactive-element" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: idx < topHotels.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: 'white', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hotel.name}</div>
                      <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>{hotel.location}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <span style={{ color: '#f6ad55', fontSize: '14px' }}>⭐</span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#2d3748' }}>{Number(hotel.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Premium Tours */}
        <div className="card-professional">
          <div className="card-header-professional">
            <h3 className="card-title-professional">Premium Tours</h3>
            <button onClick={() => nav('/tours')} className="btn btn-outline btn-ripple" style={{ padding: '6px 12px', fontSize: '10px' }}>
              View All
            </button>
          </div>
          <div className="card-body-professional">
            {popularTours.length === 0 ? (
              <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No tours yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {popularTours.map((tour, idx) => (
                  <div key={tour.id} className="interactive-element" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: idx < popularTours.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #48bb78, #38a169)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: 'white', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tour.title}</div>
                      {tour.description && <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tour.description}</div>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#48bb78', flexShrink: 0 }}>
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
      <div className="card-professional">
        <div className="card-header-professional">
          <h3 className="card-title-professional">Recent Bookings</h3>
          <button onClick={() => nav('/bookings')} className="btn btn-outline btn-ripple" style={{ padding: '6px 12px', fontSize: '10px' }}>
            View All
          </button>
        </div>
        <div className="card-body-professional">
          {recentBookings.length === 0 ? (
            <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No bookings yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {recentBookings.map(b => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                return (
                  <div key={b.id} className="interactive-element" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => nav('/bookings')}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#2d3748' }}>#{b.id} — {b.user_name || `User ${b.user_id}`}</div>
                      <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>{b.tour_title || 'Tour'}</div>
                    </div>
                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
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
