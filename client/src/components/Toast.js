import React, { useEffect, useState } from 'react';

const CONFIGS = {
  success: { color: '#48bb78', bg: 'linear-gradient(135deg, #48bb78, #38a169)', border: 'rgba(72, 187, 120, 0.3)', icon: '✓', textColor: '#f0fff4' },
  error:   { color: '#f56565', bg: 'linear-gradient(135deg, #f56565, #e53e3e)', border: 'rgba(245, 101, 101, 0.3)', icon: '✕', textColor: '#fed7d7' },
  info:    { color: '#4299e1', bg: 'linear-gradient(135deg, #4299e1, #3182ce)', border: 'rgba(66, 153, 225, 0.3)', icon: 'ℹ', textColor: '#ebf8ff' },
  warning: { color: '#ed8936', bg: 'linear-gradient(135deg, #ed8936, #dd6b20)', border: 'rgba(237, 137, 54, 0.3)', icon: '⚠', textColor: '#fffaf0' },
};

export default function Toast({ message, type = 'success', onClose }) {
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIGS[type] || CONFIGS.success;

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 3700);
    const t2 = setTimeout(onClose, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  return (
    <div className="notification-professional" style={{
      animation: leaving ? 'slideOutRight 0.4s ease forwards' : 'slideInRight 0.4s ease',
      borderLeftColor: cfg.color,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: cfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${cfg.color}40`,
        }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: '4px',
            textTransform: 'capitalize',
          }}>
            {type}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#718096',
            lineHeight: '1.4',
          }}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fee2e2';
            e.currentTarget.style.color = '#e53e3e';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a0aec0';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
