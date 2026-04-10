import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user?.role === 'professeur' ? '/prof'
             : user?.role === 'admin'      ? '/admin'
             : '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Illustration */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Syne', fontSize: '8rem', fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(255,101,132,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', userSelect: 'none' }}>
            404
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3rem', animation: 'float 3s ease-in-out infinite' }}>
            🎓
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%,100% { transform: translate(-50%,-50%) translateY(0); }
            50%      { transform: translate(-50%,-50%) translateY(-12px); }
          }
        `}</style>

        <h1 style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text)' }}>
          Page introuvable
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '.95rem', lineHeight: 1.65, marginBottom: 32 }}>
          Oops ! La page que vous cherchez n'existe pas ou a été déplacée.
          Pas de panique, votre apprentissage continue !
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '11px 22px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}
          >
            ← Retour
          </button>
          <button
            onClick={() => navigate(home)}
            style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '.9rem', color: '#fff', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}