import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/* ════════════════════════════════════════════════
   TOAST CONTEXT
════════════════════════════════════════════════ */
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
}

/* ════════════════════════════════════════════════
   PROVIDER
════════════════════════════════════════════════ */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  // Raccourcis
  const toast = {
    success: (title, message, duration) => addToast({ type: 'success', title, message, duration }),
    error:   (title, message, duration) => addToast({ type: 'error',   title, message, duration: duration || 6000 }),
    info:    (title, message, duration) => addToast({ type: 'info',    title, message, duration }),
    warning: (title, message, duration) => addToast({ type: 'warning', title, message, duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ════════════════════════════════════════════════
   TOAST CONFIG
════════════════════════════════════════════════ */
const TOAST_CFG = {
  success: { icon: '✅', color: '#43e97b', bg: 'rgba(67,233,123,0.12)',  border: 'rgba(67,233,123,0.3)'  },
  error:   { icon: '❌', color: '#ff6584', bg: 'rgba(255,101,132,0.12)', border: 'rgba(255,101,132,0.3)' },
  info:    { icon: 'ℹ️', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)'  },
  warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
};

/* ════════════════════════════════════════════════
   TOAST CONTAINER
════════════════════════════════════════════════ */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateX(110%) scale(.95); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(110%); } }
      `}</style>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CFG[toast.type] || TOAST_CFG.info;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={() => onRemove(toast.id)}
      style={{
        pointerEvents: 'all',
        minWidth: 300, maxWidth: 380,
        background: 'var(--surface)',
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        padding: '14px 16px 10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        animation: toast.visible
          ? 'toastIn .3s cubic-bezier(.34,1.56,.64,1) forwards'
          : 'toastOut .3s ease forwards',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {toast.title && (
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: cfg.color, marginBottom: toast.message ? 3 : 0 }}>
              {toast.title}
            </div>
          )}
          {toast.message && (
            <div style={{ fontSize: '.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>{toast.message}</div>
          )}
        </div>
        <span style={{ fontSize: '.75rem', color: 'var(--text2)', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>✕</span>
      </div>
      {/* Barre de progression */}
      <div style={{ height: 3, background: 'var(--border)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: cfg.color, borderRadius: 3, transition: 'width .05s linear' }} />
      </div>
    </div>
  );
}