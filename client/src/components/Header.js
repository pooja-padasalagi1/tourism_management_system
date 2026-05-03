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
  const navigate = useNavigate();
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
    navigate('/search?q=' + encodeURIComponent(term));
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
      } catch (err) {
        console.error('Failed to load booking references', err);
      }
    }
  };

  const handleCreate = async () => {
    try {
      if (quickType === 'tour') {
        await api.post('/tours', {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price || 0),
        });
        alert('Tour created successfully');
      } else if (quickType === 'hotel') {
        await api.post('/hotels', {
          name: formData.name,
          location: formData.location,
          rating: Number(formData.rating || 0),
        });
        alert('Hotel created successfully');
      } else if (quickType === 'booking') {
        await api.post('/bookings', {
          user_id: getUser()?.id,
          tour_id: formData.tour_id,
          hotel_id: formData.hotel_id,
          status: formData.status || 'pending',
        });
        alert('Booking created successfully');
      }
      setQuickOpen(false);
      setQuickType(null);
    } catch (err) {
      console.error('Create failed', err);
      alert(err.response?.data?.error || err.message || 'Create failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-professional">
      <div className="header-content">
        <div className="header-brand">
          <Link to="/dashboard" className="brand-link">
            <div className="brand-mark">✈️</div>
            <div className="brand-title">TMS</div>
          </Link>
        </div>

        <div className="header-actions">
          <form onSubmit={handleSearch} className="header-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search tours, hotels..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="search-input"
            />
          </form>

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {logged ? (
            <>
              <div className="action-group">
                <button
                  onClick={() => {
                    setQuickOpen(!quickOpen);
                    setProfileOpen(false);
                  }}
                  className="btn btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Quick Add
                </button>
                {quickOpen && !quickType && (
                  <div className="dropdown-menu">
                    {user?.role === 'admin' && (
                      <div className="dropdown-item" onClick={() => openQuick('tour')}>
                        ✈️ New Tour
                      </div>
                    )}
                    {user?.role === 'admin' && (
                      <div className="dropdown-item" onClick={() => openQuick('hotel')}>
                        🏨 New Hotel
                      </div>
                    )}
                    <div className="dropdown-item" onClick={() => openQuick('booking')}>
                      📅 New Booking
                    </div>
                  </div>
                )}
              </div>

              <div className="action-group profile-group">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setQuickOpen(false);
                    setQuickType(null);
                  }}
                  className="profile-button"
                >
                  <span className="profile-avatar">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                  <span className="profile-name">{user?.name || user?.email}</span>
                  <span className="profile-arrow">▼</span>
                </button>
                {profileOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => navigate('/profile')}>
                      👤 Profile
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/settings')}>
                      ⚙️ Settings
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      🚪 Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header-login-actions">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {quickOpen && quickType && (
        <Modal
          isOpen={quickOpen}
          title={`✨ New ${quickType.charAt(0).toUpperCase() + quickType.slice(1)}`}
          onClose={() => {
            setQuickOpen(false);
            setQuickType(null);
          }}
        >
          <div className="form-professional">
            {quickType === 'tour' && (
              <>
                <div className="form-group">
                  <label>Tour Title <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter tour title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe the tour..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </>
            )}

            {quickType === 'hotel' && (
              <>
                <div className="form-group">
                  <label>Hotel Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter hotel name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Enter hotel location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </>
            )}

            {quickType === 'booking' && (
              <>
                <div className="form-group">
                  <label>Select Tour <span className="required">*</span></label>
                  <select
                    value={formData.tour_id || ''}
                    onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
                  >
                    <option value="">-- Choose a tour --</option>
                    {refData.tours.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Hotel</label>
                  <select
                    value={formData.hotel_id || ''}
                    onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                  >
                    <option value="">-- Choose a hotel --</option>
                    {refData.hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" onClick={handleCreate} className="btn btn-primary">Create</button>
              <button
                type="button"
                onClick={() => {
                  setQuickOpen(false);
                  setQuickType(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
}
