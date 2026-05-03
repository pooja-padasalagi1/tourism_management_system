import React, { useEffect, useState } from 'react';
import api from '../api';
import Spinner from '../components/Spinner';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

function BarChart({ data, color = 'var(--primary)' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.value}</div>
          <div style={{ width: '100%', background: `${color}20`, borderRadius: '4px 4px 0 0', overflow: 'hidden', height: 60, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 100}%`, transition: 'height .5s ease', minHeight: d.value > 0 ? 4 : 0 }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color, sub, icon }) {
  return (
    <div className="stat-mini" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <div className="stat-mini-value" style={{ color, fontSize: value?.toString().length > 8 ? '1.1rem' : '1.5rem' }}>{value}</div>
      </div>
      <div className="stat-mini-label">{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

const TABS = ['overview', 'bookings', 'hotels', 'tours', 'users'];

export default function Reports() {
  const [data, setData] = useState({ users: [], hotels: [], tours: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      const [users, hotels, tours, bookings] = await Promise.all([
        api.get('/users').then(r => r.data).catch(() => []),
        api.get('/hotels').then(r => r.data).catch(() => []),
        api.get('/tours').then(r => r.data).catch(() => []),
        api.get('/bookings').then(r => r.data).catch(() => []),
      ]);
      setData({ users, hotels, tours, bookings });
      if (showRefresh) toast('Reports refreshed');
    } catch { toast('Error loading reports', 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const stats = {
    totalUsers: data.users.length,
    adminUsers: data.users.filter(u => u.role === 'admin').length,
    managerUsers: data.users.filter(u => u.role === 'manager').length,
    regularUsers: data.users.filter(u => u.role === 'user').length,
    totalHotels: data.hotels.length,
    avgHotelRating: data.hotels.length ? (data.hotels.reduce((s, h) => s + Number(h.rating || 0), 0) / data.hotels.length).toFixed(1) : '0.0',
    topRatedHotels: data.hotels.filter(h => Number(h.rating || 0) >= 4).length,
    totalTours: data.tours.length,
    totalTourRevenue: data.tours.reduce((s, t) => s + Number(t.price || 0), 0),
    avgTourPrice: data.tours.length ? (data.tours.reduce((s, t) => s + Number(t.price || 0), 0) / data.tours.length).toFixed(0) : 0,
    totalBookings: data.bookings.length,
    pendingBookings: data.bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: data.bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: data.bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: data.bookings.filter(b => b.status === 'cancelled').length,
    completionRate: data.bookings.length ? ((data.bookings.filter(b => b.status === 'completed').length / data.bookings.length) * 100).toFixed(0) : 0,
  };

  const topHotels = [...data.hotels].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5);
  const topTours = [...data.tours].sort((a, b) => Number(b.price || 0) - Number(a.price || 0)).slice(0, 5);

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}><Spinner size="lg" /><p style={{ marginTop: 16, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem' }}>Loading Reports</p></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>📈 Analytics & Reports</h1>
          <p>System-wide performance overview</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV([
            { Metric: 'Total Users', Value: stats.totalUsers }, { Metric: 'Total Hotels', Value: stats.totalHotels },
            { Metric: 'Total Tours', Value: stats.totalTours }, { Metric: 'Total Bookings', Value: stats.totalBookings },
            { Metric: 'Tour Revenue', Value: `$${stats.totalTourRevenue}` }, { Metric: 'Completion Rate', Value: `${stats.completionRate}%` },
          ], 'report-summary.csv')}>
            <Icon d={Icons.download} size={15} /> Export Summary
          </button>
          <button className="btn-icon btn-icon-ghost" onClick={() => load(true)} disabled={refreshing}>
            <Icon d={Icons.refresh} size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <StatCard label="Total Users" value={stats.totalUsers} color="var(--primary)" icon="👥" />
            <StatCard label="Total Hotels" value={stats.totalHotels} color="var(--success)" icon="🏨" sub={`Avg ${stats.avgHotelRating} ★`} />
            <StatCard label="Total Tours" value={stats.totalTours} color="#d97706" icon="✈️" sub={`Avg $${stats.avgTourPrice}`} />
            <StatCard label="Total Bookings" value={stats.totalBookings} color="#7c3aed" icon="📅" sub={`${stats.completionRate}% completed`} />
            <StatCard label="Tour Revenue" value={`$${stats.totalTourRevenue.toLocaleString()}`} color="#0891b2" icon="💰" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Booking Status</h3>
              <BarChart color="var(--primary)" data={[{ label: 'Pending', value: stats.pendingBookings }, { label: 'Confirmed', value: stats.confirmedBookings }, { label: 'Completed', value: stats.completedBookings }, { label: 'Cancelled', value: stats.cancelledBookings }]} />
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👥 User Roles</h3>
              <BarChart color="#7c3aed" data={[{ label: 'Admins', value: stats.adminUsers }, { label: 'Managers', value: stats.managerUsers }, { label: 'Users', value: stats.regularUsers }]} />
            </div>
          </div>
        </>
      )}

      {/* Bookings */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="stats-grid">
            <StatCard label="Total" value={stats.totalBookings} color="var(--primary)" />
            <StatCard label="Pending" value={stats.pendingBookings} color="#d97706" />
            <StatCard label="Confirmed" value={stats.confirmedBookings} color="var(--success)" />
            <StatCard label="Completed" value={stats.completedBookings} color="#7c3aed" />
            <StatCard label="Cancelled" value={stats.cancelledBookings} color="#dc2626" />
            <StatCard label="Completion Rate" value={`${stats.completionRate}%`} color="#0891b2" />
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking Status Distribution</h3>
              <button className="btn-icon btn-icon-ghost" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => exportCSV(data.bookings.map(b => ({ ID: b.id, User: b.user_name || b.user_id, Tour: b.tour_title || b.tour_id, Hotel: b.hotel_name || b.hotel_id, Status: b.status })), 'bookings-report.csv')}>
                <Icon d={Icons.download} size={13} /> Export
              </button>
            </div>
            <BarChart color="var(--primary)" data={[{ label: 'Pending', value: stats.pendingBookings }, { label: 'Confirmed', value: stats.confirmedBookings }, { label: 'Completed', value: stats.completedBookings }, { label: 'Cancelled', value: stats.cancelledBookings }]} />
          </div>
        </div>
      )}

      {/* Hotels */}
      {activeTab === 'hotels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="stats-grid">
            <StatCard label="Total Hotels" value={stats.totalHotels} color="var(--success)" />
            <StatCard label="Avg Rating" value={`${stats.avgHotelRating} ★`} color="#f59e0b" />
            <StatCard label="4★ & Above" value={stats.topRatedHotels} color="#7c3aed" />
            <StatCard label="Locations" value={new Set(data.hotels.map(h => h.location)).size} color="#0891b2" />
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Top Rated Hotels</h3>
              <button className="btn-icon btn-icon-ghost" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => exportCSV(data.hotels.map(h => ({ ID: h.id, Name: h.name, Location: h.location, Rating: h.rating })), 'hotels-report.csv')}>
                <Icon d={Icons.download} size={13} /> Export
              </button>
            </div>
            {topHotels.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < topHotels.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--lighter)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{h.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(Number(h.rating || 0)))}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{Number(h.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tours */}
      {activeTab === 'tours' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="stats-grid">
            <StatCard label="Total Tours" value={stats.totalTours} color="#d97706" />
            <StatCard label="Total Revenue" value={`$${stats.totalTourRevenue.toLocaleString()}`} color="var(--success)" />
            <StatCard label="Avg Price" value={`$${stats.avgTourPrice}`} color="var(--primary)" />
            <StatCard label="Luxury Tours" value={data.tours.filter(t => Number(t.price || 0) >= 1500).length} color="#7c3aed" />
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💎 Premium Tours by Price</h3>
              <button className="btn-icon btn-icon-ghost" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => exportCSV(data.tours.map(t => ({ ID: t.id, Title: t.title, Description: t.description || '', Price: t.price })), 'tours-report.csv')}>
                <Icon d={Icons.download} size={13} /> Export
              </button>
            </div>
            {topTours.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < topTours.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#d97706' }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description.substring(0, 50)}{t.description.length > 50 ? '…' : ''}</div>}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>${Number(t.price || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="stats-grid">
            <StatCard label="Total Users" value={stats.totalUsers} color="var(--primary)" />
            <StatCard label="Admins" value={stats.adminUsers} color="#7c3aed" />
            <StatCard label="Managers" value={stats.managerUsers} color="var(--primary)" />
            <StatCard label="Regular Users" value={stats.regularUsers} color="var(--success)" />
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>👥 User Role Distribution</h3>
              <button className="btn-icon btn-icon-ghost" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => exportCSV(data.users.map(u => ({ ID: u.id, Name: u.name, Email: u.email, Role: u.role })), 'users-report.csv')}>
                <Icon d={Icons.download} size={13} /> Export
              </button>
            </div>
            <BarChart color="#7c3aed" data={[{ label: 'Admins', value: stats.adminUsers }, { label: 'Managers', value: stats.managerUsers }, { label: 'Users', value: stats.regularUsers }]} />
          </div>
        </div>
      )}
    </div>
  );
}
