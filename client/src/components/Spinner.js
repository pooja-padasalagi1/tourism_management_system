import React from 'react';

export default function Spinner({ size = 'md' }) {
  const sizes = {
    sm: { size: 20, border: 2 },
    md: { size: 40, border: 3 },
    lg: { size: 60, border: 4 }
  };

  const s = sizes[size];

  return (
    <div style={{
      width: s.size,
      height: s.size,
      border: `${s.border}px solid rgba(59, 130, 246, 0.2)`,
      borderTop: `${s.border}px solid #3b82f6`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );
}
