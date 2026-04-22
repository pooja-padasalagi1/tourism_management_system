import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, title, children, onClose, maxWidth = 520 }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(4,9,18,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.18s ease',
        backdropFilter: 'blur(6px)',
        padding: '20px',
      }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #1a2d42 0%, #131f2e 100%)',
        borderRadius: '14px',
        width: '100%',
        maxWidth,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.18)',
        animation: 'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        border: '1px solid rgba(201,168,76,0.12)',
        position: 'relative',
      }}>
        {/* Gold top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #c9a84c 40%, #e2c06e 60%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 18px',
          borderBottom: '1px solid rgba(46,64,87,0.5)',
          background: 'rgba(8,15,24,0.4)',
          borderRadius: '14px 14px 0 0',
        }}>
          <h3 style={{
            margin: 0, fontSize: '13px', fontWeight: 800,
            color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '2px',
            fontFamily: "'Barlow', sans-serif",
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(46,64,87,0.6)',
              color: '#3d5a70', width: '30px', height: '30px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', padding: 0,
              textTransform: 'none', letterSpacing: 0, boxShadow: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.15)'; e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#e87070'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(46,64,87,0.6)'; e.currentTarget.style.color = '#3d5a70'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
