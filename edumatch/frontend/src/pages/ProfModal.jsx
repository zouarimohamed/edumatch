import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── CSS injecté ──────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  @keyframes modalIn  { from { opacity:0; transform:scale(.94) translateY(18px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes popIn    { from { transform:scale(0); } to { transform:scale(1); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin2    { to { transform:rotate(360deg); } }
  @keyframes barGrow  { from { width:0; } to { width:var(--w); } }
  @keyframes sigModalIn { from { opacity:0; transform:scale(.96) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .pm-tab {
    padding:11px 18px; background:none; border:none; cursor:pointer;
    font-weight:700; font-size:.82rem;
    border-bottom:2.5px solid transparent;
    transition:all .2s; display:flex; align-items:center; gap:6px;
    font-family:'Instrument Sans',sans-serif;
  }
  .pm-tab.active { color:#00153D; border-bottom-color:#00153D; }
  .pm-tab:not(.active) { color:#94A3B8; }
  .pm-tab:not(.active):hover { color:#64748B; }

  .pm-dispo-card {
    padding:16px 18px;
    border-radius:16px; cursor:pointer;
    border:1.5px solid #F1F5F9;
    background:#fff;
    transition:all .22s ease;
  }
  .pm-dispo-card:hover  { border-color:#C7D2FE; box-shadow:0 4px 16px rgba(0,21,61,0.07); }
  .pm-dispo-card.active { border-color:#00153D !important; background:#F0F4FF; box-shadow:0 4px 20px rgba(0,21,61,0.12); }

  .pm-cert-row {
    display:flex; align-items:center; gap:12px; padding:11px 14px;
    background:#F8FAFC; border:1.5px solid #F1F5F9; border-radius:12px;
    text-decoration:none; transition:all .15s;
  }
  .pm-cert-row:hover { border-color:#C7D2FE; background:#F0F4FF; }

  .pm-contact-btn {
    display:flex; align-items:center; gap:12px;
    padding:12px 16px; border-radius:12px; text-decoration:none;
    transition:all .18s; border:1.5px solid;
  }

  .pm-mode-choice {
    padding:16px; border-radius:14px; cursor:pointer;
    border:1.5px solid #E2E8F0; background:#F8FAFC;
    transition:all .18s; text-align:center;
  }
  .pm-mode-choice.active-online   { border-color:#3B82F6 !important; background:#EFF6FF; }
  .pm-mode-choice.active-presence { border-color:#10B981 !important; background:#ECFDF5; }

  .pm-reserve-btn {
    width:100%; padding:15px; border:none; border-radius:14px;
    font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.95rem;
    cursor:pointer; color:#fff; transition:all .2s;
    background:linear-gradient(135deg,#00153D,#1E3A8A);
    box-shadow:0 6px 20px rgba(0,21,61,0.28);
  }
  .pm-reserve-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,21,61,0.35); }
  .pm-reserve-btn:disabled { background:#E2E8F0; color:#94A3B8; cursor:not-allowed; box-shadow:none; }

  .pm-avis-card {
    background:#F8FAFC; border-radius:14px; padding:16px;
    border:1.5px solid #F1F5F9; animation:fadeUp .3s ease both;
  }

  .pm-section {
    background:#F8FAFC; border-radius:16px; padding:18px;
    border:1.5px solid #F1F5F9; animation:fadeUp .35s ease both;
  }
  .pm-section-title {
    font-size:.68rem; font-weight:900; color:#94A3B8;
    text-transform:uppercase; letter-spacing:.12em;
    margin-bottom:12px; display:flex; align-items:center; gap:6px;
    font-family:'Cabinet Grotesk',sans-serif;
  }

  /* ── Signalement modal overlay ── */
  .sig-overlay {
    position:fixed; inset:0;
    background:rgba(15,23,42,0.72);
    backdrop-filter:blur(12px);
    z-index:2000;
    display:flex; align-items:center; justify-content:center;
    padding:16px;
  }
  .sig-modal {
    background:#fff; border-radius:24px;
    width:100%; max-width:460px;
    max-height:90vh;
    display:flex; flex-direction:column;
    box-shadow:0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04);
    animation:sigModalIn .26s cubic-bezier(.34,1.56,.64,1);
    overflow:hidden;
  }
  .sig-modal-body {
    flex:1; overflow-y:auto; padding:20px 24px 0;
    scrollbar-width:thin; scrollbar-color:#FCA5A5 transparent;
  }
  .sig-modal-body::-webkit-scrollbar { width:5px; }
  .sig-modal-body::-webkit-scrollbar-thumb { background:#FCA5A5; border-radius:10px; }
  .sig-modal-footer {
    padding:16px 24px 20px; flex-shrink:0;
    border-top:1.5px solid #FEE2E2; background:#fff;
  }

  /* ── Bouton signaler ── */
  .sig-trigger-btn {
    display:flex; align-items:center; gap:10px;
    width:100%; padding:12px 16px;
    background:#FFF7ED; border:1.5px solid #FED7AA;
    border-radius:13px; cursor:pointer;
    font-family:'Cabinet Grotesk',sans-serif;
    font-weight:800; font-size:.85rem; color:#C2410C;
    transition:all .18s;
  }
  .sig-trigger-btn:hover {
    background:#FFEDD5; border-color:#FB923C;
    transform:translateX(3px);
    box-shadow:0 4px 14px rgba(194,65,12,0.12);
  }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('profmodal-css')) {
    const s = document.createElement('style'); s.id = 'profmodal-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ─── Helpers ─────────────────────────────── */
function fmt(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function Stars({ value, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const v = parseFloat(value) || 0;
  return (
    <div style={{ display: 'inline-flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default', color: i <= (hover || Math.round(v)) ? '#F59E0B' : '#E2E8F0', transition: 'all .15s', transform: interactive && i <= (hover || v) ? 'scale(1.2)' : 'scale(1)', display: 'inline-block' }}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ─── Avatar ───────────────────────────────── */
function ProfAvatar({ prof, size = 90 }) {
  const nom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'P';
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309'],['#1E3A8A','#2563EB']];
  const [a, b] = palettes[nom.charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 8px 28px rgba(0,0,0,0.16)', flexShrink: 0, overflow: 'hidden', background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '-.01em' }}>
      {prof.photo_url
        ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : initials}
    </div>
  );
}

const MODE_CFG = {
  en_ligne:   { icon: '🌐', label: 'En ligne',   color: '#1D4ED8', bg: '#EFF6FF',  border: '#BFDBFE' },
  presentiel: { icon: '🏫', label: 'Présentiel', color: '#065F46', bg: '#ECFDF5',  border: '#6EE7B7' },
  les_deux:   { icon: '🔀', label: 'Les deux',   color: '#4F46E5', bg: '#EEF2FF',  border: '#C7D2FE' },
};

function ModeBadge({ mode }) {
  const cfg = MODE_CFG[mode] || MODE_CFG.presentiel;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── Modal Overlay ────────────────────────── */
function ModalOverlay({ onClose, children }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 740, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 48px 120px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)', animation: 'modalIn .28s cubic-bezier(.34,1.56,.64,1)', fontFamily: "'Instrument Sans', sans-serif" }}>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MODAL SIGNALEMENT
════════════════════════════════════════════════ */
function SignalementModal({ prof, etudiantId, onClose }) {
  const profNom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'ce professeur';
  const profId  = prof.prof_id || prof.id;

  const RAISONS_PREDEFINIES = [
    'Comportement inapproprié',
    'Contenu offensant ou irrespectueux',
    'Non-respect des horaires convenus',
    'Informations de profil incorrectes ou trompeuses',
    'Demande de paiement hors plateforme',
    'Harcèlement ou propos déplacés',
    'Autre raison',
  ];

  const [raisonChoisie, setRaisonChoisie]   = useState('');
  const [raisonLibre, setRaisonLibre]       = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState(false);
  const [error, setError]                   = useState('');

  const isAutre   = raisonChoisie === 'Autre raison';
  const raisonFin = isAutre ? raisonLibre.trim() : raisonChoisie;
  const canSubmit = raisonFin.length >= 3 && !submitting;

  // Bloquer Escape sur ce modal sans fermer le ProfModal
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/admin/signalements', {
        etudiant_id: etudiantId,
        prof_id:     profId,
        raison:      raisonFin,
      });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sig-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sig-modal">

        {/* ── Header fixe ── */}
        <div style={{ flexShrink: 0, padding: '20px 24px 16px', borderBottom: '1.5px solid #FEE2E2', background: 'linear-gradient(135deg,#FFF7ED,#FEF2F2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🚨</div>
              <div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1rem', color: '#991B1B', letterSpacing: '-.01em' }}>
                  Signaler ce professeur
                </div>
                <div style={{ fontSize: '.74rem', color: '#B91C1C', marginTop: 2, fontWeight: 600 }}>
                  {profNom}
                </div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(220,38,38,0.08)', border: '1.5px solid #FCA5A5', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Corps scrollable ── */}
        {success ? (
          <div className="sig-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)' }}>✅</div>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#065F46', marginBottom: 8 }}>
              Signalement envoyé
            </div>
            <div style={{ fontSize: '.84rem', color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
              Votre signalement a été transmis à l'équipe EduMatch.<br/>
              Nous l'examinerons dans les plus brefs délais.
            </div>
            <button onClick={onClose}
              style={{ padding: '11px 28px', background: '#00153D', border: 'none', borderRadius: 12, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: '#fff', cursor: 'pointer', fontSize: '.88rem', boxShadow: '0 4px 14px rgba(0,21,61,0.22)', transition: 'all .18s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E3A8A'}
              onMouseLeave={e => e.currentTarget.style.background = '#00153D'}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="sig-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Info avertissement */}
                <div style={{ padding: '10px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 11, fontSize: '.77rem', color: '#92400E', display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.55 }}>
                  <span style={{ fontSize: '.95rem', flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                  <span>Les signalements sont traités par l'équipe EduMatch. Un faux signalement peut entraîner des mesures contre votre compte.</span>
                </div>

                {/* Raisons prédéfinies */}
                <div>
                  <div style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 9, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    Raison du signalement *
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {RAISONS_PREDEFINIES.map(r => {
                      const isSelected = raisonChoisie === r;
                      return (
                        <button key={r} onClick={() => { setRaisonChoisie(r); if (r !== 'Autre raison') setRaisonLibre(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: isSelected ? '#FEF2F2' : '#F8FAFC', border: `1.5px solid ${isSelected ? '#FCA5A5' : '#E2E8F0'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'Instrument Sans, sans-serif', width: '100%' }}
                          onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.borderColor = '#FECDD3'; } }}
                          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}>
                          <div style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${isSelected ? '#DC2626' : '#CBD5E1'}`, background: isSelected ? '#DC2626' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                            {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/>}
                          </div>
                          <span style={{ fontSize: '.83rem', color: isSelected ? '#991B1B' : '#374151', fontWeight: isSelected ? 700 : 500 }}>{r}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Champ libre si "Autre" — hauteur fixe, pas de resize vertical */}
                {isAutre && (
                  <div style={{ animation: 'fadeUp .22s ease both' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                      Précisez la raison *
                    </div>
                    <textarea
                      autoFocus
                      rows={4}
                      maxLength={500}
                      value={raisonLibre}
                      onChange={e => setRaisonLibre(e.target.value)}
                      placeholder="Décrivez le problème rencontré avec ce professeur..."
                      style={{ width: '100%', padding: '10px 13px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, outline: 'none', fontSize: '.85rem', color: '#0F172A', resize: 'none', boxSizing: 'border-box', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.55, transition: 'border-color .15s' }}
                      onFocus={e => e.target.style.borderColor = '#FCA5A5'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                    <div style={{ fontSize: '.71rem', color: raisonLibre.length > 450 ? '#DC2626' : '#94A3B8', marginTop: 4, textAlign: 'right' }}>
                      {raisonLibre.length}/500
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 10, fontSize: '.81rem', color: '#DC2626', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                  </div>
                )}

              </div>
            </div>

            {/* ── Footer fixe — boutons toujours visibles ── */}
            <div className="sig-modal-footer">
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '12px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', color: '#64748B', fontFamily: 'Instrument Sans, sans-serif', fontSize: '.86rem', transition: 'all .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                  Annuler
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit}
                  style={{ flex: 2, padding: '12px', background: canSubmit ? '#DC2626' : '#E2E8F0', border: 'none', borderRadius: 12, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed', color: canSubmit ? '#fff' : '#94A3B8', fontSize: '.9rem', transition: 'all .2s', boxShadow: canSubmit ? '0 4px 16px rgba(220,38,38,0.28)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.background = '#B91C1C'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'none'; } }}>
                  {submitting
                    ? <><div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin2 .8s linear infinite' }}/> Envoi...</>
                    : '🚨 Envoyer le signalement'}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — PROFMODAL EDUMATCH TN
════════════════════════════════════════════════ */
export default function ProfModal({ prof, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('profil');
  const [avis, setAvis] = useState([]);
  const [avisStats, setAvisStats] = useState(null);
  const [dispos, setDispos] = useState([]);
  const [monAvis, setMonAvis] = useState(null);
  const [step, setStep] = useState(null);
  const [selectedDispo, setSelectedDispo] = useState(null);
  const [modeChoisi, setModeChoisi] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reservationFaite, setReservationFaite] = useState(null);
  const [noteForm, setNoteForm] = useState(0);
  const [commentForm, setCommentForm] = useState('');
  const [sendingAvis, setSendingAvis] = useState(false);
  const [avisSuccess, setAvisSuccess] = useState(false);

  // ── États signalement ──────────────────────────
  const [showSignalement, setShowSignalement] = useState(false);
  const [etudiantId, setEtudiantId]           = useState(null);

  useEffect(() => {
    injectCSS();
    // Charger l'ID étudiant si l'utilisateur est un étudiant
    if (user?.role === 'étudiant') {
      api.get('/api/etudiants/me')
        .then(r => setEtudiantId(r.data?.id || null))
        .catch(() => setEtudiantId(null));
    }
  }, [user]);

  const profId  = prof.prof_id || prof.id;
  const profNom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'Professeur';
  const profMode = prof.mode_enseignement || 'presentiel';

  const profEmail = prof.user_email || prof.email || null;
  const profTel   = prof.telephone || null;

  const loadAvis = useCallback(() => {
    Promise.all([
      api.get(`/api/avis/professeur/${profId}`),
      api.get(`/api/avis/professeur/${profId}/stats`),
      user?.role === 'étudiant' ? api.get(`/api/avis/mon-avis/${profId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
    ]).then(([r1, r2, r3]) => {
      setAvis(r1.data || []);
      setAvisStats(r2.data);
      if (r3.data) { setMonAvis(r3.data); setNoteForm(r3.data.note); setCommentForm(r3.data.commentaire || ''); }
    });
  }, [profId, user]);

  useEffect(() => {
    if (tab === 'avis') loadAvis();
    if (tab === 'disponibilites' || step === 'choix_dispo') {
      api.get(`/api/professeurs/${profId}/disponibilites`)
        .then(r => setDispos(r.data || []))
        .catch(() => setDispos([]));
    }
  }, [tab, step, profId, loadAvis]);

  const getModeEffectif = () => {
    if (selectedDispo?.mode_seance && selectedDispo.mode_seance !== 'les_deux') return selectedDispo.mode_seance;
    if (profMode === 'les_deux') return modeChoisi;
    return profMode;
  };

  const getTarif = () => {
    const m = getModeEffectif();
    if (m === 'en_ligne')   return prof.tarif_en_ligne;
    if (m === 'presentiel') return prof.tarif_presentiel;
    return null;
  };

  const needsModeChoice = profMode === 'les_deux' && (!selectedDispo?.mode_seance || selectedDispo.mode_seance === 'les_deux');
  const canReserver     = selectedDispo && (!needsModeChoice || modeChoisi);

  const handleReserver = () => {
    const modeEff = getModeEffectif();
    if (!modeEff) { alert('Choisissez un mode de cours'); return; }
    setSubmitting(true);
    api.post('/api/reservations/', {
      prof_id: profId, disponibilite_id: selectedDispo.id,
      date_cours: selectedDispo.date_specifique,
      heure_debut: selectedDispo.heure_debut, heure_fin: selectedDispo.heure_fin,
      mode_seance: modeEff, notes_etudiant: notes,
    }).then(res => { setReservationFaite(res.data); setStep('confirmation'); })
      .catch(e => alert('Erreur : ' + (e.response?.data?.detail || e.message)))
      .finally(() => setSubmitting(false));
  };

  const handleSubmitAvis = async () => {
    if (!noteForm) { alert('Choisissez une note'); return; }
    setSendingAvis(true);
    try {
      await api.post('/api/avis/', { prof_id: profId, note: noteForm, commentaire: commentForm });
      setAvisSuccess(true);
      setTimeout(() => setAvisSuccess(false), 3000);
      loadAvis();
    } catch (e) { alert(e.response?.data?.detail || "Erreur lors de l'envoi de l'avis"); }
    finally { setSendingAvis(false); }
  };

  const now = new Date();
  const futures = dispos.filter(d => {
    if (!d.date_specifique) return true;
    const heureFin = d.heure_fin ? d.heure_fin.slice(0, 5) : '23:59';
    const fin = new Date(`${d.date_specifique}T${heureFin}:00`);
    return fin > now;
  });
  const disponibles = futures.filter(d => d.nb_inscrits < d.nb_max_etudiants);
  const complets    = futures.filter(d => d.nb_inscrits >= d.nb_max_etudiants);

  const TABS = [
    { key: 'profil',         icon: '👤', label: 'Profil'                         },
    { key: 'disponibilites', icon: '📅', label: 'Disponibilités'                 },
    { key: 'avis',           icon: '⭐', label: `Avis (${prof.nb_avis || 0})`    },
  ];

  /* ── VUE CONFIRMATION ── */
  if (step === 'confirmation' && reservationFaite) {
    const isOnline = reservationFaite.mode_seance === 'en_ligne';
    return (
      <ModalOverlay onClose={onClose}>
        <div style={{ padding: '48px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 12px 40px rgba(16,185,129,0.35)', animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)' }}>
            🎉
          </div>
          <div>
            <h2 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px', color: '#0F172A', letterSpacing: '-.02em' }}>Réservation envoyée !</h2>
            <p style={{ color: '#64748B', fontSize: '.9rem', margin: 0, lineHeight: 1.6 }}>
              Votre demande a été transmise à <strong style={{ color: '#0F172A' }}>{profNom}</strong>.<br/>
              Vous serez notifié dès sa réponse.
            </p>
          </div>
          <div style={{ width: '100%', background: '#F8FAFC', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, border: '1.5px solid #F1F5F9', textAlign: 'left' }}>
            {[
              ['📆', 'Date',    fmt(reservationFaite.date_cours)],
              ['🕒', 'Horaire', `${reservationFaite.heure_debut?.slice(0,5)} → ${reservationFaite.heure_fin?.slice(0,5)}`],
              ['📡', 'Mode',    isOnline ? '🌐 En ligne' : '🏫 Présentiel'],
              ...(getTarif() ? [['💰', 'Tarif', `${getTarif()} DT/séance`]] : []),
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>{icon} {label}</span>
                <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: '#0F172A' }}>{val}</span>
              </div>
            ))}
            {isOnline && (
              <div style={{ marginTop: 6, padding: '10px 14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, fontSize: '.82rem', color: '#1D4ED8', display: 'flex', gap: 8, alignItems: 'center' }}>
                🎥 Un lien Google Meet vous sera communiqué par le professeur.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '13px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', color: '#64748B', fontFamily: 'Instrument Sans, sans-serif', transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
              Fermer
            </button>
            <button onClick={() => { onClose(); navigate('/reservations'); }}
              style={{ flex: 2, padding: '13px', background: '#00153D', border: 'none', borderRadius: 12, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: 'pointer', color: '#fff', boxShadow: '0 4px 16px rgba(0,21,61,0.22)', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00153D'; e.currentTarget.style.transform = 'none'; }}>
              Voir mes réservations
            </button>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <>
      {/* ── Modal signalement (par-dessus ProfModal) ── */}
      {showSignalement && etudiantId && (
        <SignalementModal
          prof={prof}
          etudiantId={etudiantId}
          onClose={() => setShowSignalement(false)}
        />
      )}

      <ModalOverlay onClose={onClose}>

        {/* ── HERO ─────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          {/* Bandeau */}
          <div style={{ height: 90, background: 'linear-gradient(135deg,#00153D 0%,#1E3A8A 55%,#2563EB 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
            <div style={{ position: 'absolute', bottom: -50, left: 80, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .07 }} viewBox="0 0 500 90" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(i % 8) * 70 + 15} cy={Math.floor(i / 8) * 36 + 16} r="1.8" fill="#fff"/>)}
            </svg>
            <button onClick={onClose}
              style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              aria-label="Fermer">
              ✕
            </button>
          </div>

          {/* Infos prof */}
          <div style={{ padding: '0 28px 16px', display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: -44, position: 'relative', zIndex: 2 }}>
            <div style={{ flexShrink: 0 }}>
              <ProfAvatar prof={prof} size={88}/>
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <h2 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 7px', color: '#0F172A', letterSpacing: '-.025em' }}>{profNom}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <ModeBadge mode={profMode}/>
                {prof.ville && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.76rem', color: '#64748B', fontWeight: 600 }}>
                    📍 {prof.ville}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Stars value={prof.note_moyenne} size={14}/>
                  <span style={{ fontSize: '.75rem', color: '#94A3B8', fontWeight: 600 }}>({prof.nb_avis || 0} avis)</span>
                </div>
                {profTel && (
                  <a href={`tel:${profTel}`}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.73rem', fontWeight:700, padding:'4px 11px', borderRadius:20, background:'#ECFDF5', color:'#065F46', border:'1.5px solid #6EE7B7', textDecoration:'none', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#D1FAE5'; e.currentTarget.style.borderColor='#10B981'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#ECFDF5'; e.currentTarget.style.borderColor='#6EE7B7'; }}>
                    📞 {profTel}
                  </a>
                )}
                {profEmail && (
                  <a href={`mailto:${profEmail}`}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.73rem', fontWeight:700, padding:'4px 11px', borderRadius:20, background:'#EFF6FF', color:'#1D4ED8', border:'1.5px solid #BFDBFE', textDecoration:'none', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#DBEAFE'; e.currentTarget.style.borderColor='#3B82F6'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#EFF6FF'; e.currentTarget.style.borderColor='#BFDBFE'; }}>
                    ✉️ {profEmail}
                  </a>
                )}
              </div>
            </div>

            {/* Tarifs */}
            {(prof.tarif_en_ligne || prof.tarif_presentiel) && (
              <div style={{ display: 'flex', gap: 8, paddingBottom: 8, flexShrink: 0 }}>
                {prof.tarif_en_ligne && parseFloat(prof.tarif_en_ligne) > 0 && (
                  <div style={{ textAlign: 'center', padding: '8px 14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 13 }}>
                    <div style={{ fontSize: '.62rem', fontWeight: 800, color: '#1D4ED8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>🌐 En ligne</div>
                    <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, color: '#1D4ED8', fontSize: '1.1rem', lineHeight: 1 }}>{prof.tarif_en_ligne} DT</div>
                    <div style={{ fontSize: '.6rem', color: '#64748B', marginTop: 2 }}>/séance</div>
                  </div>
                )}
                {prof.tarif_presentiel && parseFloat(prof.tarif_presentiel) > 0 && (
                  <div style={{ textAlign: 'center', padding: '8px 14px', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 13 }}>
                    <div style={{ fontSize: '.62rem', fontWeight: 800, color: '#065F46', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>🏫 Présentiel</div>
                    <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, color: '#065F46', fontSize: '1.1rem', lineHeight: 1 }}>{prof.tarif_presentiel} DT</div>
                    <div style={{ fontSize: '.6rem', color: '#64748B', marginTop: 2 }}>/séance</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #F1F5F9', padding: '0 20px', gap: 2 }}>
            {TABS.map(t => (
              <button key={t.key} className={`pm-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => { setTab(t.key); setStep(null); }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENU ──────────────────────────── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>

          {/* ════ PROFIL ════ */}
          {tab === 'profil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Bio */}
              {prof.bio && (
                <div className="pm-section">
                  <div className="pm-section-title">📝 À propos</div>
                  <p style={{ margin: 0, fontSize: '.88rem', color: '#374151', lineHeight: 1.78, borderLeft: '3px solid #00153D', paddingLeft: 14, fontStyle: 'italic' }}>
                    {prof.bio}
                  </p>
                </div>
              )}

              {/* Contact */}
              {(profTel || profEmail) && (
                <div className="pm-section">
                  <div className="pm-section-title">📬 Contacter le formateur</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profTel && (
                      <a href={`tel:${profTel}`} className="pm-contact-btn"
                        style={{ background:'#fff', borderColor:'#6EE7B7', color:'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#ECFDF5'; e.currentTarget.style.borderColor='#10B981'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#6EE7B7'; }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.05rem', flexShrink:0 }}>📞</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2, fontFamily:'Cabinet Grotesk, sans-serif' }}>Téléphone</div>
                          <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, color:'#065F46', fontSize:'.92rem' }}>{profTel}</div>
                        </div>
                        <span style={{ fontSize:'.72rem', fontWeight:700, color:'#065F46', background:'#ECFDF5', padding:'4px 12px', borderRadius:20, border:'1.5px solid #6EE7B7', whiteSpace:'nowrap' }}>Appeler →</span>
                      </a>
                    )}
                    {profEmail && (
                      <a href={`mailto:${profEmail}`} className="pm-contact-btn"
                        style={{ background:'#fff', borderColor:'#BFDBFE', color:'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#EFF6FF'; e.currentTarget.style.borderColor='#3B82F6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#BFDBFE'; }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.05rem', flexShrink:0 }}>✉️</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2, fontFamily:'Cabinet Grotesk, sans-serif' }}>Email</div>
                          <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, color:'#1D4ED8', fontSize:'.88rem', wordBreak:'break-all' }}>{profEmail}</div>
                        </div>
                        <span style={{ fontSize:'.72rem', fontWeight:700, color:'#1D4ED8', background:'#EFF6FF', padding:'4px 12px', borderRadius:20, border:'1.5px solid #BFDBFE', whiteSpace:'nowrap' }}>Écrire →</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Matières */}
              {prof.tarifs_matieres && prof.tarifs_matieres.length > 0 && (
                <div className="pm-section">
                  <div className="pm-section-title">📚 Matières enseignées</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[...new Set(prof.tarifs_matieres.map(t => t.nom_matiere))].map(m => (
                      <span key={m} style={{ padding: '6px 14px', background: '#F0F4FF', border: '1.5px solid #C7D2FE', borderRadius: 20, fontSize: '.82rem', fontWeight: 700, color: '#1E40AF' }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Niveaux */}
              {prof.niveaux && prof.niveaux.length > 0 && (
                <div className="pm-section">
                  <div className="pm-section-title">🎓 Niveaux couverts</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {prof.niveaux.map(n => (
                      <span key={n} style={{ padding: '5px 12px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: '.82rem', color: '#64748B', fontWeight: 600 }}>{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificats */}
              {prof.certificats && prof.certificats.length > 0 && (
                <div className="pm-section">
                  <div className="pm-section-title">📜 Diplômes & Certificats</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {prof.certificats.map(c => (
                      <a key={c.id} href={`http://localhost:8001${c.fichier_url}`} target="_blank" rel="noreferrer" className="pm-cert-row">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                          {c.fichier_url?.endsWith('.pdf') ? '📄' : '🖼️'}
                        </div>
                        <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '.85rem', flex: 1, color: '#0F172A' }}>{c.titre}</span>
                        <span style={{ fontSize: '.74rem', color: '#1D4ED8', fontWeight: 700, background: '#EFF6FF', padding: '3px 10px', borderRadius: 20 }}>Consulter ↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── BOUTON RÉSERVER ── */}
              {user?.role === 'étudiant' && (
                <button className="pm-reserve-btn"
                  onClick={() => { setTab('disponibilites'); setStep('choix_dispo'); }}>
                  📅 Réserver un cours
                </button>
              )}
              {!user && (
                <button className="pm-reserve-btn"
                  onClick={() => { onClose(); navigate('/login'); }}>
                  🔐 Se connecter pour réserver
                </button>
              )}

              {/* ══ BOUTON SIGNALER — visible uniquement pour les étudiants connectés ══ */}
              {user?.role === 'étudiant' && etudiantId && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ height: 1, background: '#F1F5F9', marginBottom: 14 }}/>
                  <button
                    className="sig-trigger-btn"
                    onClick={() => setShowSignalement(true)}>
                    <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>🚨</span>
                    <span style={{ flex: 1 }}>Signaler ce professeur</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#FEE2E2', color: '#C2410C', border: '1.5px solid #FCA5A5' }}>
                      Signalement
                    </span>
                  </button>
                  <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 1.5 }}>
                    Un signalement sérieux aide à maintenir la qualité de la plateforme.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ DISPONIBILITÉS ════ */}
          {tab === 'disponibilites' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {step !== 'recapitulatif' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.95rem', color: '#0F172A' }}>
                      {disponibles.length > 0
                        ? <><span style={{ color: '#065F46' }}>{disponibles.length}</span> créneau{disponibles.length > 1 ? 'x' : ''} disponible{disponibles.length > 1 ? 's' : ''}</>
                        : 'Aucun créneau disponible'}
                    </div>
                    {user?.role === 'étudiant' && selectedDispo && (
                      <button onClick={() => setStep('recapitulatif')}
                        style={{ padding: '8px 20px', background: '#00153D', border: 'none', borderRadius: 12, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: 'pointer', color: '#fff', fontSize: '.83rem', boxShadow: '0 4px 14px rgba(0,21,61,0.22)', transition: 'all .18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#00153D'; e.currentTarget.style.transform = 'none'; }}>
                        Confirmer →
                      </button>
                    )}
                  </div>

                  {disponibles.length === 0 && complets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: '#F8FAFC', borderRadius: 18, color: '#94A3B8', border: '1.5px solid #F1F5F9' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                      <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 5 }}>Aucune disponibilité planifiée</div>
                      <div style={{ fontSize: '.83rem' }}>Ce professeur n'a pas encore ajouté de créneaux.</div>
                    </div>
                  )}

                  {disponibles.map(d => {
                    const isSelected = selectedDispo?.id === d.id;
                    const pct = Math.round((d.nb_inscrits / d.nb_max_etudiants) * 100);
                    return (
                      <div key={d.id} className={`pm-dispo-card${isSelected ? ' active' : ''}`}
                        onClick={() => { if (user?.role === 'étudiant') setSelectedDispo(isSelected ? null : d); }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.95rem', color: '#0F172A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00153D', display: 'inline-block' }}/>}
                              📅 {fmt(d.date_specifique)}
                            </div>
                            <div style={{ fontSize: '.83rem', color: '#1D4ED8', fontWeight: 700 }}>
                              🕒 {d.heure_debut?.slice(0,5)} → {d.heure_fin?.slice(0,5)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: d.mode_seance === 'en_ligne' ? '#EFF6FF' : '#ECFDF5', color: d.mode_seance === 'en_ligne' ? '#1D4ED8' : '#065F46', border: `1.5px solid ${d.mode_seance === 'en_ligne' ? '#BFDBFE' : '#6EE7B7'}` }}>
                                {d.mode_seance === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel'}
                              </span>
                            </div>
                            <div style={{ fontSize: '.74rem', color: '#94A3B8', fontWeight: 600 }}>
                              👥 {d.nb_inscrits}/{d.nb_max_etudiants} inscrits
                            </div>
                          </div>
                        </div>
                        {d.description && (
                          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '.8rem', flexShrink: 0, marginTop: 1 }}>📝</span>
                            <div style={{ fontSize: '.78rem', color: '#374151', lineHeight: 1.55, fontStyle: 'italic' }}>{d.description}</div>
                          </div>
                        )}
                        <div style={{ marginTop: 10, height: 4, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: pct >= 80 ? '#F59E0B' : '#10B981', transition: 'width .5s ease' }}/>
                        </div>
                      </div>
                    );
                  })}

                  {complets.length > 0 && (
                    <>
                      <div style={{ fontSize: '.7rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 8, fontFamily: 'Cabinet Grotesk, sans-serif' }}>Créneaux complets</div>
                      {complets.map(d => (
                        <div key={d.id} style={{ padding: '14px 18px', background: '#F9FAFB', border: '1.5px solid #F1F5F9', borderRadius: 14, opacity: .6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '.9rem', marginBottom: 3, color: '#0F172A' }}>📅 {fmt(d.date_specifique)}</div>
                              <div style={{ fontSize: '.8rem', color: '#64748B' }}>🕒 {d.heure_debut?.slice(0,5)} → {d.heure_fin?.slice(0,5)}</div>
                            </div>
                            <span style={{ fontSize: '.74rem', fontWeight: 700, color: '#DC2626', padding: '4px 12px', borderRadius: 20, background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>🔴 Complet</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              {/* Récap + confirmation */}
              {step === 'recapitulatif' && selectedDispo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button onClick={() => setStep(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '.85rem', padding: 0, alignSelf: 'flex-start', fontWeight: 600, transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00153D'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                    ← Retour aux créneaux
                  </button>

                  <div style={{ padding: '16px 18px', background: '#F0F4FF', border: '1.5px solid #C7D2FE', borderRadius: 16 }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: '#1E40AF', marginBottom: 10, fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>📋 Créneau sélectionné</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.88rem' }}>
                      {[
                        ['📅', fmt(selectedDispo.date_specifique)],
                        ['🕒', `${selectedDispo.heure_debut?.slice(0,5)} → ${selectedDispo.heure_fin?.slice(0,5)}`],
                        ['👥', `${selectedDispo.nb_inscrits}/${selectedDispo.nb_max_etudiants} inscrits`],
                      ].map(([icon, val]) => (
                        <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{icon}</span>
                          <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, color: '#0F172A' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {needsModeChoice && (
                    <div>
                      <div style={{ fontSize: '.7rem', fontWeight: 900, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Cabinet Grotesk, sans-serif' }}>Choisissez votre mode</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { value: 'en_ligne',   icon: '🌐', label: 'En ligne',   tarif: prof.tarif_en_ligne,   activeClass: 'active-online',   color: '#1D4ED8' },
                          { value: 'presentiel', icon: '🏫', label: 'Présentiel', tarif: prof.tarif_presentiel, activeClass: 'active-presence', color: '#065F46' },
                        ].map(m => {
                          const active = modeChoisi === m.value;
                          return (
                            <div key={m.value} onClick={() => setModeChoisi(m.value)}
                              className={`pm-mode-choice${active ? ' ' + m.activeClass : ''}`}>
                              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{m.icon}</div>
                              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: active ? m.color : '#0F172A', fontSize: '.9rem' }}>{m.label}</div>
                              {m.tarif && <div style={{ fontSize: '.78rem', color: active ? m.color : '#94A3B8', marginTop: 4, fontWeight: 600 }}>{m.tarif} DT/séance</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!needsModeChoice && (
                    <div style={{ padding: '12px 16px', background: selectedDispo.mode_seance === 'en_ligne' ? '#EFF6FF' : '#ECFDF5', border: `1.5px solid ${selectedDispo.mode_seance === 'en_ligne' ? '#BFDBFE' : '#6EE7B7'}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: selectedDispo.mode_seance === 'en_ligne' ? '#1D4ED8' : '#065F46' }}>
                        {selectedDispo.mode_seance === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel'}
                      </span>
                      {getTarif() && <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.1rem', color: selectedDispo.mode_seance === 'en_ligne' ? '#1D4ED8' : '#065F46' }}>{getTarif()} DT/séance</span>}
                    </div>
                  )}

                  {getModeEffectif() === 'en_ligne' && (
                    <div style={{ padding: '10px 14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, fontSize: '.8rem', color: '#1D4ED8', display: 'flex', gap: 8, alignItems: 'center' }}>
                      🎥 Un lien Google Meet sera partagé automatiquement.
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '.7rem', fontWeight: 900, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                      Message pour le professeur (optionnel)
                    </div>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Ex: Je prépare le bac, j'ai des difficultés en algèbre..."
                      style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, color: '#0F172A', padding: '10px 13px', width: '100%', outline: 'none', fontSize: '.86rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Instrument Sans, sans-serif', transition: 'border-color .15s' }}
                      onFocus={e => e.target.style.borderColor = '#3B82F6'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}/>
                  </div>

                  <button className="pm-reserve-btn" onClick={handleReserver} disabled={!canReserver || submitting}>
                    {submitting
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin2 .8s linear infinite', display: 'inline-block' }}/> Envoi en cours...</span>
                      : '✅ Confirmer la réservation'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════ AVIS ════ */}
          {tab === 'avis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {avisStats && (
                <div style={{ background: '#F8FAFC', borderRadius: 20, padding: 22, display: 'flex', gap: 24, alignItems: 'center', border: '1.5px solid #F1F5F9' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '3.2rem', fontWeight: 900, lineHeight: 1, color: '#0F172A', letterSpacing: '-.04em' }}>
                      {avisStats.moyenne.toFixed(1)}
                    </div>
                    <Stars value={avisStats.moyenne} size={18}/>
                    <div style={{ fontSize: '.74rem', color: '#94A3B8', marginTop: 6, fontWeight: 600 }}>{avisStats.total} avis</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(s => {
                      const count = avisStats.distribution[s] || 0;
                      const pct = avisStats.total > 0 ? Math.round((count / avisStats.total) * 100) : 0;
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: '.72rem', color: '#64748B', width: 12, textAlign: 'right', flexShrink: 0, fontWeight: 700 }}>{s}</span>
                          <span style={{ color: '#F59E0B', fontSize: '.8rem' }}>★</span>
                          <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#F59E0B,#FCD34D)', width: `${pct}%`, transition: 'width .6s ease' }}/>
                          </div>
                          <span style={{ fontSize: '.72rem', color: '#94A3B8', width: 24, flexShrink: 0, fontWeight: 600 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {user?.role === 'étudiant' && (
                <div style={{ background: '#F8FAFC', borderRadius: 18, padding: 20, border: '1.5px solid #F1F5F9' }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    {monAvis ? '✏️ Modifier mon avis' : '✍️ Laisser un avis'}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '.82rem', color: '#64748B', marginBottom: 8, fontWeight: 600 }}>Ma note</div>
                    <Stars value={noteForm} size={28} interactive onChange={setNoteForm}/>
                    {noteForm > 0 && (
                      <div style={{ marginTop: 6, fontSize: '.8rem', color: '#F59E0B', fontWeight: 700, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                        {['','Décevant 😕','Passable 😐','Bien 🙂','Très bien 😊','Excellent 🌟'][noteForm]}
                      </div>
                    )}
                  </div>
                  <textarea rows={3} value={commentForm} onChange={e => setCommentForm(e.target.value)}
                    placeholder="Partagez votre expérience avec ce professeur... (optionnel)"
                    style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, color: '#0F172A', padding: '10px 13px', width: '100%', outline: 'none', fontSize: '.86rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'Instrument Sans, sans-serif', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = '#3B82F6'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}/>
                  <button onClick={handleSubmitAvis} disabled={!noteForm || sendingAvis}
                    style={{ width: '100%', padding: '12px', background: avisSuccess ? '#10B981' : !noteForm || sendingAvis ? '#E2E8F0' : '#F59E0B', border: 'none', borderRadius: 12, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: !noteForm || sendingAvis ? 'not-allowed' : 'pointer', color: (!noteForm || sendingAvis) ? '#94A3B8' : '#fff', fontSize: '.88rem', transition: 'all .3s', boxShadow: (noteForm && !sendingAvis) ? '0 4px 14px rgba(245,158,11,0.3)' : 'none' }}>
                    {avisSuccess ? '✅ Avis publié !' : sendingAvis ? '⏳ Envoi...' : monAvis ? '💾 Mettre à jour mon avis' : '⭐ Publier mon avis'}
                  </button>
                  {!monAvis && (
                    <div style={{ marginTop: 10, fontSize: '.74rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 }}>
                      ℹ️ Vous devez avoir eu un cours confirmé avec ce professeur pour laisser un avis.
                    </div>
                  )}
                </div>
              )}

              {avis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 16, color: '#94A3B8', border: '1.5px solid #F1F5F9' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
                  <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 5 }}>Aucun avis pour ce professeur</div>
                  <div style={{ fontSize: '.83rem' }}>Soyez le premier à partager votre expérience !</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {avis.map(a => {
                    const initials = (a.etudiant || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
                    const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9']];
                    const [col1, col2] = palettes[(a.etudiant||'A').charCodeAt(0) % palettes.length];
                    return (
                      <div key={a.id} className="pm-avis-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${col1},${col2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 900, color: '#fff', flexShrink: 0, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.88rem', color: '#0F172A' }}>{a.etudiant}</div>
                              {a.created_at && (
                                <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 1 }}>
                                  {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <Stars value={a.note} size={14}/>
                            {monAvis?.id === a.id && (
                              <span style={{ fontSize: '.63rem', color: '#1D4ED8', fontWeight: 700, background: '#EFF6FF', padding: '2px 8px', borderRadius: 20, border: '1px solid #BFDBFE' }}>Mon avis</span>
                            )}
                          </div>
                        </div>
                        {a.commentaire && (
                          <p style={{ margin: 0, fontSize: '.85rem', color: '#374151', lineHeight: 1.65 }}>{a.commentaire}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </ModalOverlay>
    </>
  );
}