import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, getUser, logout } from '../auth';
import Modal from './Modal';
import api from '../api';

export default function Header() {
  const logged = !!getToken();
  const user = getUser();
  const [theme, setTheme] = useState('light');
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickType, setQuickType] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [refData, setRefData] = useState({ tours: [], hotels: [] });

  useEffect(() => {
    const stored = localStorage.getItem('tms_theme') || 'light';
    setTheme(stored);
    if (stored === 'dark') document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('tms_theme', next);
    if (next === 'dark') document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    nav('/search?q=' + encodeURIComponent(term));
    setQ('');
  };

  const openQuick = async (type) => {
    setQuickType(type);
    setQuickOpen(true);
    setFormData({});
    if (type === 'booking'){
      try{
        const [tRes, hRes] = await Promise.all([api.get('/tours'), api.get('/hotels')]);
        setRefData({ tours: tRes.data || [], hotels: hRes.data || [] });
      }catch(e){ console.error('Error loading refs', e); }
    }
  };

  const handleCreate = async () => {
    try{
      if (quickType === 'tour'){
        await api.post('/tours', { title: formData.title, description: formData.description, price: Number(formData.price||0) });
        alert('Tour created');
      } else if (quickType === 'hotel'){
        await api.post('/hotels', { name: formData.name, location: formData.location, rating: Number(formData.rating||0) });
        alert('Hotel created');
      } else if (quickType === 'booking'){
        await api.post('/bookings', { user_id: formData.user_id || (getUser()?.id), tour_id: formData.tour_id, hotel_id: formData.hotel_id, status: formData.status || 'pending' });
        alert('Booking created');
      }
      setQuickOpen(false);
    }catch(err){
      console.error('Create error', err);
      alert(err.response?.data?.error || err.message || 'Create failed');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="site-header">
      <div className="brand">🌍 Tourism Management</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            className="site-search"
            aria-label="Search"
            placeholder="🔍 Search tours, hotels, users..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Theme toggle - always visible */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          style={{
            padding: '12px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
            border: '2px solid rgba(255,255,255,0.4)',
            color: '#1f2937',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '14px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(255,255,255,0.5)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(255,255,255,0.5)';
          }}
        >
          <span style={{ fontSize: '22px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          <span style={{ letterSpacing: '0.5px' }}>{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
        </button>

        {!logged ? (
          <nav>
            <Link to="/login" style={{
              padding: '12px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
              color: '#6366f1',
              fontWeight: 800,
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px',
              fontSize: '13px',
              textTransform: 'uppercase',
              border: '2px solid rgba(255,255,255,0.4)'
            }}>
              Login
            </Link>
          </nav>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setQuickOpen(!quickOpen)} 
                style={{ 
                  padding: '12px 20px', 
                  borderRadius: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.3px'
                }}
              >
                <span style={{ fontSize: '18px' }}>✨</span>
                <span>Quick Add</span>
              </button>
              {quickOpen && (
                <div style={{ 
                  position: 'absolute', 
                  right: 0, 
                  marginTop: 12, 
                  background: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb', 
                  borderRadius: 12, 
                  boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.12)', 
                  overflow: 'hidden', 
                  zIndex: 1000,
                  minWidth: '180px',
                  animation: 'slideInDown 0.2s ease'
                }}>
                  {user?.role === 'admin' && (
                    <div 
                      onClick={() => openQuick('tour')} 
                      style={{ 
                        padding: '12px 18px', 
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
                        e.currentTarget.style.paddingLeft = '22px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '18px';
                      }}
                    >
                      <span>🗺️</span> New Tour
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div 
                      onClick={() => openQuick('hotel')} 
                      style={{ 
                        padding: '12px 18px', 
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
                        e.currentTarget.style.paddingLeft = '22px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '18px';
                      }}
                    >
                      <span>🏨</span> New Hotel
                    </div>
                  )}
                  <div 
                    onClick={() => openQuick('booking')} 
                    style={{ 
                      padding: '12px 18px', 
                      cursor: 'pointer',
                      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                      transition: 'all 0.2s ease',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
                      e.currentTarget.style.paddingLeft = '22px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '18px';
                    }}
                  >
                    <span>📅</span> New Booking
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                style={{ 
                  padding: '10px 18px', 
                  borderRadius: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 700,
                  fontSize: '14px'
                }}
              >
                <span style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span>{user?.name || user?.email}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>▾</span>
              </button>
              {profileOpen && (
                <div style={{ 
                  position: 'absolute', 
                  right: 0, 
                  marginTop: 12, 
                  background: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb', 
                  borderRadius: 12, 
                  boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.12)', 
                  overflow: 'hidden', 
                  zIndex: 1000,
                  minWidth: '160px',
                  animation: 'slideInDown 0.2s ease'
                }}>
                  <div 
                    onClick={() => { nav('/profile'); setProfileOpen(false); }} 
                    style={{ 
                      padding: '12px 18px', 
                      cursor: 'pointer',
                      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                      transition: 'all 0.2s ease',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
                      e.currentTarget.style.paddingLeft = '22px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '18px';
                    }}
                  >
                    <span>👤</span> Profile
                  </div>
                  <div 
                    onClick={() => { nav('/settings'); setProfileOpen(false); }} 
                    style={{ 
                      padding: '12px 18px', 
                      cursor: 'pointer',
                      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                      transition: 'all 0.2s ease',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
                      e.currentTarget.style.paddingLeft = '22px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '18px';
                    }}
                  >
                    <span>⚙️</span> Settings
                  </div>
                  <div 
                    onClick={() => { handleLogout(); setProfileOpen(false); }} 
                    style={{ 
                      padding: '12px 18px', 
                      cursor: 'pointer', 
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f3f4f6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                      e.currentTarget.style.paddingLeft = '22px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '18px';
                    }}
                  >
                    <span>🚪</span> Logout
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Modal */}
            {quickOpen && quickType && (
              <Modal isOpen={quickOpen} title={quickType === 'tour' ? 'Create Tour' : quickType === 'hotel' ? 'Create Hotel' : 'Create Booking'} onClose={() => { setQuickOpen(false); setQuickType(null); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 320 }}>
                  {quickType === 'tour' && (
                    <>
                      <input 
                        placeholder="Title" 
                        value={formData.title||''} 
                        onChange={e=>setFormData({...formData, title: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                      <textarea 
                        placeholder="Description" 
                        value={formData.description||''} 
                        onChange={e=>setFormData({...formData, description: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                      <input 
                        type="number" 
                        placeholder="Price" 
                        value={formData.price||''} 
                        onChange={e=>setFormData({...formData, price: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                    </>
                  )}
                  {quickType === 'hotel' && (
                    <>
                      <input 
                        placeholder="Name" 
                        value={formData.name||''} 
                        onChange={e=>setFormData({...formData, name: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                      <input 
                        placeholder="Location" 
                        value={formData.location||''} 
                        onChange={e=>setFormData({...formData, location: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                      <input 
                        type="number" 
                        placeholder="Rating" 
                        value={formData.rating||''} 
                        onChange={e=>setFormData({...formData, rating: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      />
                    </>
                  )}
                  {quickType === 'booking' && (
                    <>
                      <select 
                        value={formData.tour_id||''} 
                        onChange={e=>setFormData({...formData, tour_id: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      >
                        <option value="">Select tour</option>
                        {refData.tours.map(t=> <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      <select 
                        value={formData.hotel_id||''} 
                        onChange={e=>setFormData({...formData, hotel_id: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      >
                        <option value="">Select hotel</option>
                        {refData.hotels.map(h=> <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <select 
                        value={formData.status||'pending'} 
                        onChange={e=>setFormData({...formData, status: e.target.value})}
                        style={{
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                          border: theme === 'dark' ? '2px solid rgba(255,255,255,0.15)' : '2px solid var(--border)'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                      </select>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCreate}>Create</button>
                    <button onClick={() => { setQuickOpen(false); setQuickType(null); }}>Cancel</button>
                  </div>
                </div>
              </Modal>
            )}
          </>
        )}
      </div>
    </header>
  );
}
