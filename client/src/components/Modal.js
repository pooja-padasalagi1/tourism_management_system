import React, { useState, useEffect } from 'react';

export default function Modal({ isOpen, title, children, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('theme-dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isClosing ? 'rgba(0, 0, 0, 0)' : (isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: isClosing ? 'fadeOut 0.2s ease forwards' : 'fadeIn 0.2s ease forwards',
      transition: 'background-color 0.2s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
        }
      `}</style>
      <div style={{
        backgroundColor: isDark ? '#1e293b' : '#fff',
        borderRadius: '16px',
        boxShadow: isDark ? '0 25px 50px rgba(0, 0, 0, 0.6)' : '0 25px 50px rgba(0, 0, 0, 0.15)',
        border: isDark ? '1px solid rgba(255,255,255,0.15)' : 'none',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        animation: isClosing ? 'modalSlideOut 0.2s ease forwards' : 'modalSlideIn 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          backgroundColor: isDark ? '#1e293b' : '#fff',
          background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: isDark ? '#f1f5f9' : '#1f2937' }}>
            {title}
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: isDark ? '#cbd5e1' : '#6b7280',
              padding: '0 8px',
              transition: 'all 0.2s ease',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              e.target.style.color = isDark ? '#f1f5f9' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = isDark ? '#cbd5e1' : '#6b7280';
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
