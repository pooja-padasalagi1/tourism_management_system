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
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-menu-toggle"
        style={{
          position: 'fixed', top: '18px', left: '16px', zIndex: 1001,
          background: 'linear-gradient(135deg, #1a73e8 0%, #2196F3 100%)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          width: '38px', height: '38px', borderRadius: '6px',
          cursor: 'pointer', fontSize: '18px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26,115,232,0.4)'
        }}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside style={{
        width: sidebarW,
        height: 'calc(100vh - 68px)',
        background: 'linear-gradient(180deg, #1565c0 0%, #1a73e8 40%, #1976d2 100%)',
        color: '#fff',
        padding: isOpen ? (collapsed ? '16px 8px' : '16px 0') : '0',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.25s ease, padding 0.25s ease',
        position: 'fixed',
        left: 0,
        top: '68px',
        zIndex: 100,
        borderRight: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '4px 0 24px rgba(26,115,232,0.3)',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 0 16px 0' : '0 12px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '8px',
          gap: 8,
        }}>
          {!collapsed && (
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              Navigation
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              width: '28px', height: '28px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              padding: 0,
              textTransform: 'none',
              letterSpacing: 0,
              boxShadow: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: collapsed ? '0 4px' : '0 8px' }}>
          {menuItems.filter(item => item.show).map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : '10px',
                  padding: collapsed ? '11px' : '10px 12px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  transition: 'all 0.18s ease',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active && !collapsed ? '2px solid #fff' : '2px solid transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: '13px',
                  letterSpacing: '0.3px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
              >
                <NavIcon path={item.path} size={16} />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider + Logout */}
        {!collapsed && (
          <div style={{ padding: '16px 8px 8px 8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }}
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        />
      )}
    </>
  );
}
