import React from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }[type];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 2000,
      animation: 'slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s forwards',
      maxWidth: '400px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 4px',
          margin: '0 -8px 0 0',
          borderRadius: '4px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
      >
        ✕
      </button>
    </div>
  );
}
