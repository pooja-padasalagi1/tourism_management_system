import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Reports(){
  const [data, setData] = useState({
    users: [],
    hotels: [],
    tours: [],
    bookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(){
      try {
        const [users, hotels, tours, bookings] = await Promise.all([
          api.get('/users').then(r => r.data).catch(() => []),
          api.get('/hotels').then(r => r.data).catch(() => []),
          api.get('/tours').then(r => r.data).catch(() => []),
          api.get('/bookings').then(r => r.data).catch(() => [])
        ]);
        setData({ users, hotels, tours, bookings });
      } catch(e) {
        console.error('Error loading reports:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = {
    totalUsers: data.users.length,
    adminUsers: data.users.filter(u => u.role === 'admin').length,
    managerUsers: data.users.filter(u => u.role === 'manager').length,
    regularUsers: data.users.filter(u => u.role === 'user').length,
    totalHotels: data.hotels.length,
    avgHotelRating: data.hotels.length > 0 ? (data.hotels.reduce((sum, h) => sum + Number(h.rating || 0), 0) / data.hotels.length).toFixed(1) : '0.0',
    totalTours: data.tours.length,
    totalRevenue: (data.tours.reduce((sum, t) => sum + Number(t.price || 0), 0)).toFixed(2),
    totalBookings: data.bookings.length,
    pendingBookings: data.bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: data.bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: data.bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: data.bookings.filter(b => b.status === 'cancelled').length
  };

  const topHotels = [...data.hotels].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5);
  const mostExpensiveTours = [...data.tours].sort((a, b) => Number(b.price || 0) - Number(a.price || 0)).slice(0, 5);

  return (
    <div className="page">
      <h2>📈 Analytics & Reports</h2>
      
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>📊 System Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Total Users</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏨</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{stats.totalHotels}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Total Hotels</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✈️</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{stats.totalTours}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Total Tours</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{stats.totalBookings}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Total Bookings</div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>👥 User Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Admins</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{stats.adminUsers}</div>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Managers</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{stats.managerUsers}</div>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Regular Users</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.regularUsers}</div>
              </div>
            </div>
          </div>

          {/* Booking Statistics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>📅 Booking Status Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>⏳ Pending</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.pendingBookings}</div>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>✅ Confirmed</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.confirmedBookings}</div>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>🎉 Completed</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{stats.completedBookings}</div>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>❌ Cancelled</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{stats.cancelledBookings}</div>
              </div>
            </div>
          </div>

          {/* Hotel & Tour Statistics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>🏨 Hotel & Tour Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '32px' }}>⭐</div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Average Hotel Rating</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{stats.avgHotelRating}/5</div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '32px' }}>💰</div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Tour Revenue</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>${stats.totalRevenue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Rated Hotels */}
          {topHotels.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>⭐ Top Rated Hotels</h3>
              <div className="card">
                {topHotels.map((hotel, idx) => (
                  <div key={hotel.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: idx < topHotels.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: '#f3f4f6',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: '#6b7280'
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{hotel.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{hotel.location}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', color: '#f59e0b' }}>
                      {'⭐'.repeat(Math.min(Math.round(Number(hotel.rating || 0)), 5))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Expensive Tours */}
          {mostExpensiveTours.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>💎 Premium Tours</h3>
              <div className="card">
                {mostExpensiveTours.map((tour, idx) => (
                  <div key={tour.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: idx < mostExpensiveTours.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: '#f3f4f6',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: '#6b7280'
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{tour.title}</div>
                        {tour.description && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {tour.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '16px' }}>
                      ${ (Number(tour.price) || 0).toFixed(2) }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
