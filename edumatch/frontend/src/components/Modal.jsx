import React, { useEffect } from 'react';

export default function Modal({ children, onClose, maxWidth = 600 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '28px 32px',
        width: '100%',
        maxWidth,
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'modalIn .25s ease',
        boxShadow: '0 24px 80px rgba(0,0,0,.5)',
      }}>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function ModalHeader({ title, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 20,
    }}>
      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>
        {title}
      </div>
      <button
        onClick={onClose}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--text)', fontSize: '1rem',
        }}
      >
        ✕
      </button>
    </div>
  );
}