import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 100%)',
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
      padding: '1rem 1.5rem',
      fontSize: '0.85rem',
      borderTop: '1px solid rgba(255,255,255,0.15)',
      marginLeft: '240px',
      transition: 'margin-left 0.25s ease',
    }}>
      <span>© {new Date().getFullYear()} Tourism Management System · Built for seamless travel management</span>
    </footer>
  );
}
