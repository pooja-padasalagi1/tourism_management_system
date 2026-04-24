import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card-professional" style={{
      textAlign: 'center',
      padding: '80px 40px',
      border: '2px dashed rgba(102, 126, 234, 0.2)',
      animation: 'fadeIn 0.5s ease',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(102, 126, 234, 0.02))',
    }}>
      {icon && (
        <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>
          {icon}
        </div>
      )}
      <h3 className="font-display" style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '0 0 32px 0', fontSize: '16px', color: '#718096', lineHeight: '1.6', fontWeight: 500 }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: '24px' }}>
          {action}
        </div>
      )}
    </div>
  );
}
