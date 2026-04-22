import React, { useEffect, useState } from 'react';

const CONFIGS = {
  success: { color: '#27ae60', bg: 'rgba(39,174,96,0.12)', border: 'rgba(39,174,96,0.3)', icon: '✓' },
  error:   { color: '#c0392b', bg: 'rgba(192,57,43,0.12)', border: 'rgba(192,57,43,0.3)', icon: '✕' },
  info:    { color: '#3d8bcd', bg: 'rgba(61,139,205,0.12)', border: 'rgba(61,139,205,0.3)', icon: 'i' },
  warning: { color: '#e67e22', bg: 'rgba(230,126,34,0.12)', border: 'rgba(230,126,34,0.3)', icon: '!' },
};

export default function Toast({ message, type = 'success', onClose }) {
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIGS[type] || CONFIGS.success;

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2700);
    const t2 = setTimeout(onClose, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '20px',
      background: '#0d1b2a',
      border: `1px solid ${cfg.border}`,
      borderLeft: `3px solid ${cfg.color}`,
      color: cfg.color,
      padding: '14px 18px',
      borderRadius: '8px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: '12px',
      fontSize: '13px', fontWeight: 700,
      zIndex: 2000,
      animation: leaving ? 'slideOutRight 0.3s ease forwards' : 'slideInRight 0.3s ease',
      maxWidth: '360px', minWidth: '240px',
    }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 900, flexShrink: 0,
      }}>
        {cfg.icon}
      </span>
      <span style={{ flex: 1, color: '#c5d0db' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', border: 'none', color: '#3d5a70',
          cursor: 'pointer', fontSize: '14px', padding: '0 2px',
          transition: 'color 0.15s', boxShadow: 'none',
          textTransform: 'none', letterSpacing: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#c5d0db'}
        onMouseLeave={e => e.currentTarget.style.color = '#3d5a70'}
      >
        ✕
      </button>
    </div>
  );
}
