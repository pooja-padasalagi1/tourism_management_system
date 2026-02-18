import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Spinner from '../components/Spinner';

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <div style={{
    animation: `slideInUp 0.5s ease ${delay}s backwards`
  }}>
    <div className="card" style={{
      textAlign: 'center',
      padding: '35px 25px',
      background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
      border: `2px solid ${color}20`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontSize: '48px',
        opacity: 0.1
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '52px', 
        marginBottom: '16px',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '48px', 
        fontWeight: 900,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: '12px 0',
        animation: 'float 3s ease-in-out infinite'
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: 'var(--muted)', 
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.5px'
      }}>
        {label}
      </div>
    </div>
  </div>
);

export default function Dashboard(){
  const [counts, setCounts] = useState({users:0, hotels:0, tours:0, bookings:0});
  const [topHotels, setTopHotels] = useState([]);
  const [popularTours, setPopularTours] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load(){
      try {
        const [users, hotels, tours, bookings] = await Promise.all([
          api.get('/users').then(r => r.data).catch(() => []),
          api.get('/hotels').then(r => r.data).catch(() => []),
          api.get('/tours').then(r => r.data).catch(() => []),
          api.get('/bookings').then(r => r.data).catch(() => [])
        ]);
        
        setCounts({ 
          users: users.length, 
          hotels: hotels.length, 
          tours: tours.length, 
          bookings: bookings.length 
        });

        // Top rated hotels
        const sortedHotels = [...hotels].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
        setTopHotels(sortedHotels);

        // Popular tours (by price - assuming higher price = premium)
        const sortedTours = [...tours].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5);
        setPopularTours(sortedTours);

        // Recent bookings
        setRecentBookings(bookings.slice(0, 5));

        // Extract unique locations from hotels
        const uniqueLocations = [...new Set(hotels.map(h => h.location).filter(Boolean))];
        const locationStats = uniqueLocations.map(loc => ({
          name: loc,
          count: hotels.filter(h => h.location === loc).length
        })).sort((a, b) => b.count - a.count).slice(0, 6);
        setLocations(locationStats);

      } catch(e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: '#f59e0b' },
    confirmed: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: '#10b981' },
    cancelled: { bg: 'rgba(244,63,94,0.1)', text: '#f43f5e', border: '#f43f5e' }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontSize: '42px',
            filter: 'drop-shadow(0 4px 8px rgba(99,102,241,0.3))'
          }}>🌍</span>
          <span>Dashboard</span>
        </h2>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: 'var(--muted)', 
          fontSize: '15px',
          fontWeight: 500
        }}>
          Welcome back! Here's what's happening with your tourism platform
        </p>
      </div>
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '500px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
          borderRadius: '20px',
          border: '2px dashed rgba(99,102,241,0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size="lg" />
            <p style={{ 
              marginTop: '24px', 
              color: 'var(--muted)', 
              fontSize: '18px',
              fontWeight: 600
            }}>
              Loading your dashboard...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="card-list" style={{ marginBottom: '40px' }}>
            <StatCard icon="👥" label="Total Users" value={counts.users} color="#6366f1" delay={0.1} />
            <StatCard icon="🏨" label="Total Hotels" value={counts.hotels} color="#8b5cf6" delay={0.2} />
            <StatCard icon="✈️" label="Total Tours" value={counts.tours} color="#ec4899" delay={0.3} />
            <StatCard icon="📅" label="Total Bookings" value={counts.bookings} color="#f59e0b" delay={0.4} />
          </div>

          {/* Top Hotels Section */}
          <div style={{ 
            marginBottom: '40px',
            animation: 'slideInUp 0.5s ease 0.5s backwards'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>🏆</span>
                Top Rated Hotels
              </h3>
              <button
                onClick={() => nav('/hotels')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(139,92,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139,92,246,0.3)';
                }}
              >
                View All →
              </button>
            </div>
            
            {topHotels.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏨</div>
                <p>No hotels available yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {topHotels.map((hotel, idx) => (
                  <div 
                    key={hotel.id} 
                    className="card"
                    style={{
                      padding: '24px',
                      cursor: 'pointer',
                      animation: `slideInUp 0.4s ease ${0.6 + idx * 0.1}s backwards`
                    }}
                    onClick={() => nav('/hotels')}
                  >
                    <div style={{ 
                      fontSize: '32px', 
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      🏨
                    </div>
                    <h4 style={{ 
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--text)',
                      textAlign: 'center'
                    }}>
                      {hotel.name}
                    </h4>
                    <div style={{ 
                      textAlign: 'center',
                      color: 'var(--muted)',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '12px'
                    }}>
                      📍 {hotel.location}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245,158,11,0.2)'
                    }}>
                      <span style={{ fontSize: '16px' }}>⭐</span>
                      <span style={{ 
                        fontWeight: 700,
                        color: '#f59e0b',
                        fontSize: '16px'
                      }}>
                        {hotel.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Tours Section */}
          <div style={{ 
            marginBottom: '40px',
            animation: 'slideInUp 0.5s ease 0.7s backwards'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>🌟</span>
                Premium Tours
              </h3>
              <button
                onClick={() => nav('/tours')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(236,72,153,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(236,72,153,0.3)';
                }}
              >
                View All →
              </button>
            </div>
            
            {popularTours.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
                <p>No tours available yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {popularTours.map((tour, idx) => (
                  <div 
                    key={tour.id} 
                    className="card"
                    style={{
                      padding: '24px',
                      cursor: 'pointer',
                      animation: `slideInUp 0.4s ease ${0.8 + idx * 0.1}s backwards`
                    }}
                    onClick={() => nav('/tours')}
                  >
                    <div style={{ 
                      fontSize: '32px', 
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      ✈️
                    </div>
                    <h4 style={{ 
                      margin: '0 0 12px 0',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--text)',
                      textAlign: 'center',
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {tour.title}
                    </h4>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
                      borderRadius: '10px',
                      border: '2px solid rgba(99,102,241,0.15)'
                    }}>
                      <span style={{ fontSize: '20px' }}>💰</span>
                      <span style={{ 
                        fontSize: '22px',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        ${Number(tour.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div style={{ 
            marginBottom: '40px',
            animation: 'slideInUp 0.5s ease 0.9s backwards'
          }}>
            <h3 style={{ 
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>📍</span>
              Popular Locations
            </h3>
            
            {locations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                <p>No locations available yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {locations.map((loc, idx) => (
                  <div 
                    key={idx} 
                    className="card"
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      animation: `slideInUp 0.4s ease ${1.0 + idx * 0.08}s backwards`
                    }}
                    onClick={() => nav('/hotels')}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📍</div>
                    <div style={{ 
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--text)',
                      marginBottom: '6px'
                    }}>
                      {loc.name}
                    </div>
                    <div style={{ 
                      fontSize: '24px',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {loc.count}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: 'var(--muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {loc.count === 1 ? 'Hotel' : 'Hotels'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings Section */}
          <div style={{ 
            animation: 'slideInUp 0.5s ease 1.1s backwards'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>📅</span>
                Recent Bookings
              </h3>
              <button
                onClick={() => nav('/bookings')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(245,158,11,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)';
                }}
              >
                View All →
              </button>
            </div>
            
            {recentBookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <p>No bookings yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {recentBookings.map((booking, idx) => {
                  const statusStyle = statusColors[booking.status] || statusColors.pending;
                  return (
                    <div 
                      key={booking.id} 
                      className="card"
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        animation: `slideInUp 0.4s ease ${1.2 + idx * 0.08}s backwards`,
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                      onClick={() => nav('/bookings')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                        }}>
                          📅
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: 800,
                            fontSize: '16px',
                            color: 'var(--text)',
                            marginBottom: '4px'
                          }}>
                            Booking #{booking.id}
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: 'var(--muted)',
                            fontWeight: 600
                          }}>
                            User ID: {booking.user_id}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: `2px solid ${statusStyle.border}30`
                      }}>
                        {booking.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
