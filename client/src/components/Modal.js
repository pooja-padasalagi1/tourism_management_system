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
      className="modal-overlay-professional"
    >
      <div className="modal-content-professional" style={{ maxWidth }}>
        <button
          onClick={onClose}
          className="modal-close-professional"
          aria-label="Close modal"
        >
          ×
        </button>

        {title && (
          <div className="modal-header-professional">
            <h2 className="font-display">{title}</h2>
          </div>
        )}

        <div className="modal-body-professional">
          {children}
        </div>
      </div>
    </div>
  );
}
