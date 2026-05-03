import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getToken, getUser } from '../auth';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    path: '/hotels',
    label: 'Hotels',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
  },
  {
    path: '/tours',
    label: 'Tours',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
      </svg>
    ),
  },
  {
    path: '/tour-packages',
    label: 'Tour Packages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
  },
  {
    path: '/tour-guides',
    label: 'Tour Guides',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    path: '/ratings',
    label: 'Ratings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
  },
  {
    path: '/enquiries',
    label: 'Enquiries',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z"/>
        <path d="M22 6l-10 7L2 6"/>
      </svg>
    ),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    path: '/payments',
    label: 'Payments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    path: '/transport',
    label: 'Transport',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    path: '/reviews',
    label: 'Reviews',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
  },
  {
    path: '/map',
    label: 'Map',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
  },
  {
    path: '/reports',
    label: 'Reports',
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
  },
  {
    path: '/users',
    label: 'Travellers',
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [collapsed, setCollapsed] = useState(false);

  const logged = !!getToken();
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 768) setIsOpen(false);
      else setIsOpen(true);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!logged) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && window.innerWidth < 768 && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:49 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: '70px',
        bottom: 0,
        width: collapsed ? '68px' : '240px',
        background: 'linear-gradient(180deg, #1e40af 0%, #1d4ed8 40%, #2563eb 100%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, transform 0.25s ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: '4px 0 20px rgba(30,64,175,0.3)',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '16px 0' : '16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          minHeight: '60px',
        }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>✈️</div>
              <span style={{ color:'#fff', fontWeight:800, fontSize:'15px', letterSpacing:'-0.3px' }}>
                TMS Pro
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              width: '28px', height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {visibleItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : '12px',
                  padding: collapsed ? '12px 0' : '11px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  background: active
                    ? 'rgba(255,255,255,0.18)'
                    : 'transparent',
                  borderLeft: active ? '3px solid #fff' : '3px solid transparent',
                  borderRight: 'none',
                  transition: 'all 0.18s ease',
                  margin: '1px 0',
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
                    e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.85 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: '#fff',
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: user info + logout */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          padding: collapsed ? '12px 0' : '12px 16px',
        }}>
          {!collapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '10px',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '14px', color: '#fff', flexShrink: 0,
              }}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.name || user?.email}
                </div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'11px', textTransform:'capitalize' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: collapsed ? '10px 0' : '9px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: collapsed ? 0 : '8px',
              transition: 'background 0.2s',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            title={collapsed ? 'Logout' : undefined}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
}
