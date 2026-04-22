import React from 'react';

export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 20, md: 36, lg: 52 };
  const s = sizes[size] || 36;
  const b = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{
        width: s, height: s,
        border: `${b}px solid rgba(201,168,76,0.15)`,
        borderTop: `${b}px solid #c9a84c`,
        borderRight: `${b}px solid rgba(201,168,76,0.4)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
