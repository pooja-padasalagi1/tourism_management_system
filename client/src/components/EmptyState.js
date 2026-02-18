import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card" style={{
      textAlign: 'center',
      padding: '60px 40px',
      color: '#6b7280',
      background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)',
      borderStyle: 'dashed',
      animation: 'slideInUp 0.4s ease'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '20px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}>
        {icon}
      </div>
      <h3 style={{
        margin: '0 0 12px 0',
        color: '#1f2937',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{
        margin: '0 0 24px 0',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        {description}
      </p>
      {action}
    </div>
  );
}
