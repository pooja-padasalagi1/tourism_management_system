import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getToken, getUser } from '../auth';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  useEffect(() => {
    function onResize(){
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

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', show: logged },
    { path: '/hotels', label: 'Hotels', icon: '🏨', show: logged },
    { path: '/tours', label: 'Tours', icon: '✈️', show: logged },
    { path: '/bookings', label: 'Bookings', icon: '📅', show: logged },
    { path: '/users', label: 'Users', icon: '👥', show: logged && isAdmin },
    { path: '/reports', label: 'Reports', icon: '📈', show: logged },
  ];

  if (!logged) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#fff',
          border: 'none',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '20px'
        }}
        className="mobile-menu-toggle"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        style={{
          width: isOpen ? '260px' : '0',
          height: 'calc(100vh - 70px)',
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: '#fff',
          padding: isOpen ? '20px 0' : '0',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.3s ease',
          position: 'fixed',
          left: '0',
          top: '70px',
          zIndex: '100',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '30px',
          letterSpacing: '-0.5px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          🌍 TMS
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingX: '8px' }}>
          {menuItems.filter(item => item.show).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                margin: '0 8px',
                transition: 'all 0.3s ease',
                background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #60a5fa' : '3px solid transparent',
                fontWeight: isActive(item.path) ? '600' : '500'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              {isActive(item.path) && (
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>▶</span>
              )}
            </Link>
          ))}
        </nav>

        {/* (Logout moved to Header) */}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        />
      )}
    </>
  );
}
