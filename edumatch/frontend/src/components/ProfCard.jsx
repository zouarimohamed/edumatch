import React from 'react';

function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span>
      <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.floor(v))}</span>
      <span style={{ color: 'var(--text2)', fontSize: '.8rem' }}> {v.toFixed(1)}</span>
    </span>
  );
}

export default function ProfCard({ prof, score, onView }) {
  return (
    <div
      onClick={() => onView && onView(prof)}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
        overflow: 'hidden', cursor: 'pointer', transition: 'all .25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,.5)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(108,99,255,.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Header */}
      <div style={{ height: 80, background: 'linear-gradient(135deg,rgba(108,99,255,.3),rgba(255,101,132,.2))', position: 'relative' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--bg)', background: 'linear-gradient(135deg,#6c63ff,#ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', position: 'absolute', bottom: -32, left: 20 }}>
          {prof.photo_url ? <img src={prof.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👨‍🏫'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '40px 20px 20px' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
          {prof.user_nom || prof.nom || 'Professeur'}
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 3, margin: '8px 0 14px' }}>
          <span>📚 {prof.matieres?.[0] || prof.matiere || '—'}</span>
          <span>📍 {prof.ville || '—'}</span>
          <span>💰 {prof.tarif} DT/séance</span>
        </div>

        {/* Match score */}
        {score !== null && score !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(108,99,255,.1)', border: '1px solid rgba(108,99,255,.2)', borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '.75rem', color: 'var(--text2)' }}>Match</span>
            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#6c63ff,#43e97b)', borderRadius: 3, width: `${score}%` }} />
            </div>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#6c63ff' }}>{score}%</span>
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {(prof.niveaux || []).slice(0, 2).map(n => (
            <span key={n} style={{ background: 'rgba(108,99,255,.15)', color: '#6c63ff', fontSize: '.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{n}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stars n={prof.note_moyenne} />
          <button
            onClick={e => { e.stopPropagation(); onView && onView(prof); }}
            style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}
          >Voir Profil</button>
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--text2)', marginTop: 6 }}>
          {prof.nb_avis} avis · <span style={{ color: prof.disponible !== false ? '#43e97b' : '#ff6584' }}>● {prof.disponible !== false ? 'Disponible' : 'Indisponible'}</span>
        </div>
      </div>
    </div>
  );
}
