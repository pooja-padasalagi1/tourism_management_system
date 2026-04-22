import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, getUser, logout } from '../auth';
import Modal from './Modal';
import api from '../api';

export default function Header() {
  const logged = !!getToken();
  const user = getUser();
  const [theme, setTheme] = useState('dark');
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickType, setQuickType] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [refData, setRefData] = useState({ tours: [], hotels: [] });

  useEffect(() => {
    const stored = localStorage.getItem('tms_theme') || 'dark';
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
    if (type === 'booking') {
      try {
        const [tRes, hRes] = await Promise.all([api.get('/tours'), api.get('/hotels')]);
        setRefData({ tours: tRes.data || [], hotels: hRes.data || [] });
      } catch(e) { console.error('Error loading refs', e); }
    }
  };

  const handleCreate = async () => {
    try {
      if (quickType === 'tour') {
        await api.post('/tours', { title: formData.title, description: formData.description, price: Number(formData.price || 0) });
        alert('Tour created');
      } else if (quickType === 'hotel') {
        await api.post('/hotels', { name: formData.name, location: formData.location, rating: Number(formData.rating || 0) });
        alert('Hotel created');
      } else if (quickType === 'booking') {
        await api.post('/bookings', { user_id: formData.user_id || (getUser()?.id), tour_id: formData.tour_id, hotel_id: formData.hotel_id, status: formData.status || 'pending' });
        alert('Booking created');
      }
      setQuickOpen(false);
    } catch(err) {
      console.error('Create error', err);
      alert(err.response?.data?.error || err.message || 'Create failed');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const dropdownStyle = {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    background: '#0d1b2a',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '8px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    zIndex: 1000,
    minWidth: '180px',
    animation: 'slideInDown 0.2s ease',
  };

  const dropItemStyle = {
    padding: '11px 16px',
    cursor: 'pointer',
    color: '#8899aa',
    transition: 'all 0.15s ease',
    fontWeight: 600,
    fontSize: '12px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(61,90,128,0.2)',
  };

  return (
    <header className="site-header">
      <div className="brand">
        TMS <span>Pro</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            className="site-search"
            aria-label="Search"
            placeholder="Search tours, hotels..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            background: 'transparent',
            border: '1px solid rgba(61,90,128,0.5)',
            color: '#5a7080',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.color = '#c9a84c'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(61,90,128,0.5)'; e.currentTarget.style.color = '#5a7080'; }}
        >
          {theme === 'dark' ? '◑' : '○'} {theme === 'dark' ? 'Dark' : 'Light'}
        </button>

        {!logged ? (
          <Link to="/login" style={{
            padding: '8px 20px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #a8872e 0%, #c9a84c 100%)',
            color: '#0d1b2a',
            fontWeight: 800,
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            Login
          </Link>
        ) : (
          <>
            {/* Quick Add */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setQuickOpen(!quickOpen); setProfileOpen(false); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid rgba(61,90,128,0.5)',
                  color: '#5a7080',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.color = '#c9a84c'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(61,90,128,0.5)'; e.currentTarget.style.color = '#5a7080'; }}
              >
                + Quick Add
              </button>
              {quickOpen && !quickType && (
                <div style={dropdownStyle}>
                  {user?.role === 'admin' && (
                    <div style={dropItemStyle} onClick={() => openQuick('tour')}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#c9a84c'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8899aa'; }}>
                      New Tour
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div style={dropItemStyle} onClick={() => openQuick('hotel')}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#c9a84c'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8899aa'; }}>
                      New Hotel
                    </div>
                  )}
                  <div style={{ ...dropItemStyle, borderBottom: 'none' }} onClick={() => openQuick('booking')}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#c9a84c'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8899aa'; }}>
                    New Booking
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setQuickOpen(false); setQuickType(null); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  color: '#c9a84c',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                  textTransform: 'none',
                  letterSpacing: '0',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
              >
                <span style={{
                  width: '26px', height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a8872e 0%, #c9a84c 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 900, color: '#0d1b2a',
                }}>
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || user?.email}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
              </button>
              {profileOpen && (
                <div style={dropdownStyle}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(61,90,128,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#5a7080', textTransform: 'uppercase', letterSpacing: '1px' }}>Signed in as</div>
                    <div style={{ fontSize: '13px', color: '#c9a84c', fontWeight: 700, marginTop: '2px' }}>{user?.name || user?.email}</div>
                    <div style={{ fontSize: '11px', color: '#3d5a70', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</div>
                  </div>
                  <div
                    style={{ ...dropItemStyle, borderBottom: 'none', color: '#c0392b', borderTop: '1px solid rgba(61,90,128,0.2)' }}
                    onClick={() => { handleLogout(); setProfileOpen(false); }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Sign Out
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Modal */}
            {quickOpen && quickType && (
              <Modal isOpen={quickOpen} title={quickType === 'tour' ? 'New Tour' : quickType === 'hotel' ? 'New Hotel' : 'New Booking'} onClose={() => { setQuickOpen(false); setQuickType(null); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 320 }}>
                  {quickType === 'tour' && (
                    <>
                      <input placeholder="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                      <input type="number" placeholder="Price" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </>
                  )}
                  {quickType === 'hotel' && (
                    <>
                      <input placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      <input placeholder="Location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                      <input type="number" placeholder="Rating (0-5)" value={formData.rating || ''} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                    </>
                  )}
                  {quickType === 'booking' && (
                    <>
                      <select value={formData.tour_id || ''} onChange={e => setFormData({ ...formData, tour_id: e.target.value })}>
                        <option value="">Select tour</option>
                        {refData.tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      <select value={formData.hotel_id || ''} onChange={e => setFormData({ ...formData, hotel_id: e.target.value })}>
                        <option value="">Select hotel</option>
                        {refData.hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <select value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                      </select>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button onClick={handleCreate} style={{ flex: 1 }}>Create</button>
                    <button onClick={() => { setQuickOpen(false); setQuickType(null); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(61,90,128,0.5)', color: '#5a7080', boxShadow: 'none' }}>Cancel</button>
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
