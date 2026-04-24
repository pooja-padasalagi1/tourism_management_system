import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getToken, getUser } from '../auth';

const NAV_ICONS = {
  '/dashboard':     { svg: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  '/hotels':        { svg: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  '/tours':         { svg: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  '/tour-packages': { svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  '/tour-guides':   { svg: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  '/map':           { svg: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  '/reviews':       { svg: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  '/transport':     { svg: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  '/bookings':      { svg: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  '/payments':      { svg: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  '/users':         { svg: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  '/reports':       { svg: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
};

function NavIcon({ path, size = 18 }) {
  const d = NAV_ICONS[path]?.svg;
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('tms_sidebar_collapsed') === '1'; } catch(e) { return false; }
  });

  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 768) setIsOpen(false);
      else setIsOpen(true);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const logged = !!getToken();
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('tms_sidebar_collapsed', next ? '1' : '0'); } catch(e) {}
  };

  const menuItems = [
    { path: '/dashboard',     label: 'Dashboard',        show: logged },
    { path: '/hotels',        label: 'Hotels',           show: logged },
    { path: '/tours',         label: 'Tours',            show: logged },
    { path: '/tour-packages', label: 'Tour Packages',    show: logged },
    { path: '/tour-guides',   label: 'Tour Guides',      show: logged },
    { path: '/map',           label: 'Map',              show: logged },
    { path: '/reviews',       label: 'Reviews',          show: logged },
    { path: '/transport',     label: 'Transport',        show: logged },
    { path: '/bookings',      label: 'Bookings',         show: logged },
    { path: '/payments',      label: 'Payments',         show: logged },
    { path: '/users',         label: 'Users',            show: logged && isAdmin },
    { path: '/reports',       label: 'Reports',          show: logged },
  ];

  if (!logged) return null;

  const sidebarW = isOpen ? (collapsed ? 64 : 240) : 0;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && window.innerWidth < 768 && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-professional ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: '#2d3748',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              TMS Pro
            </h2>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#718096',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#2d3748'}
              onMouseLeave={e => e.currentTarget.style.color = '#718096'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                style={{
                  '--hover-color': item.color,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '16px' : '16px 24px',
                }}
              >
                <span style={{
                  fontSize: '18px',
                  marginRight: collapsed ? '0' : '12px',
                  color: isActive ? item.color : '#718096',
                  transition: 'color 0.3s ease',
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span style={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2d3748' : '#4a5568',
                    transition: 'all 0.3s ease',
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {logged && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            marginTop: 'auto',
          }}>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {!collapsed && (
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                      marginBottom: '2px',
                    }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#718096',
                      textTransform: 'capitalize',
                    }}>
                      {user?.role || 'user'}
                    </div>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    fontSize: '12px',
                    borderColor: '#e53e3e',
                    color: '#e53e3e',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fed7d7';
                    e.currentTarget.style.borderColor = '#e53e3e';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#e53e3e';
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
