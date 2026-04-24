import React from 'react';

export default function Spinner({ size = 'md', type = 'spinner' }) {
  const sizes = { sm: 24, md: 40, lg: 64 };
  const s = sizes[size] || 40;

  if (type === 'dots') {
    return (
      <div className="loading-dots" style={{ width: s * 2, height: s / 3 }}>
        <div style={{ width: s / 4, height: s / 4, background: '#667eea', borderRadius: '50%' }}></div>
        <div style={{ width: s / 4, height: s / 4, background: '#667eea', borderRadius: '50%' }}></div>
        <div style={{ width: s / 4, height: s / 4, background: '#667eea', borderRadius: '50%' }}></div>
        <div style={{ width: s / 4, height: s / 4, background: '#667eea', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{
          width: s, height: s,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '50%',
          animation: 'pulse 1.5s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
        }} />
        <div style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>Loading...</div>
      </div>
    );
  }

  // Default spinner
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div className="loading-spinner" style={{ width: s, height: s }} />
      <div style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>Loading...</div>
    </div>
  );
}
