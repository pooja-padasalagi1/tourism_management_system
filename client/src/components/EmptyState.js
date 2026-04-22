import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 40px',
      border: '1px dashed rgba(61,90,128,0.4)',
      borderRadius: '12px',
      background: 'rgba(13,27,42,0.3)',
      animation: 'fadeIn 0.3s ease',
    }}>
      {icon && (
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.35, filter: 'grayscale(1)' }}>
          {icon}
        </div>
      )}
      <h3 style={{ margin: '0 0 8px 0', color: '#5a7080', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#3d5a70', lineHeight: '1.6' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
