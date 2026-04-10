import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─── CSS injecté ──────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .etdb-root { font-family: 'Instrument Sans', sans-serif; background: #FDFEFF; min-height: 100vh; }

  @keyframes fadeUp    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeLeft  { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes scaleIn   { from { opacity:0; transform:scale(.93); } to { opacity:1; transform:scale(1); } }
  @keyframes spin2     { to { transform:rotate(360deg); } }
  @keyframes pulse2    { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes blink2    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes slideCard { from { opacity:0; transform:translateY(24px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  .stat-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:20px; padding:18px 20px; cursor:pointer;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    transition:all .25s cubic-bezier(.22,1,.36,1);
  }
  .stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,21,61,0.09); }

  .session-card {
    padding:16px 18px; background:#fff; border-radius:16px;
    border:1.5px solid #F1F5F9;
    box-shadow:0 1px 6px rgba(0,0,0,0.04);
    transition:all .2s ease;
  }
  .session-card:hover { border-color:#C7D2FE; box-shadow:0 6px 20px rgba(0,21,61,0.07); }

  .section-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:22px; padding:24px;
    box-shadow:0 2px 14px rgba(0,0,0,0.04);
  }

  .action-btn {
    display:flex; align-items:center; gap:12px;
    padding:12px 16px; border-radius:14px; cursor:pointer;
    font-weight:700; font-size:.85rem;
    transition:all .18s ease; text-align:left; border:none;
    font-family:'Instrument Sans',sans-serif;
  }
  .action-btn:hover { transform:translateX(5px); }

  .prof-mini-card {
    padding:14px; background:#F8FAFC; border-radius:16px;
    cursor:pointer; border:1.5px solid #F1F5F9;
    transition:all .22s ease;
  }
  .prof-mini-card:hover { border-color:#C7D2FE; background:#F0F4FF; transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,21,61,0.07); }

  .section-header-btn {
    font-size:.74rem; color:#00153D; background:#EEF2FF;
    border:1.5px solid #C7D2FE; padding:5px 14px;
    border-radius:20px; cursor:pointer; font-weight:700;
    font-family:'Cabinet Grotesk',sans-serif;
    transition:all .15s;
  }
  .section-header-btn:hover { background:#E0E7FF; }

  .find-prof-btn {
    padding:12px 24px; border:none; border-radius:14px; cursor:pointer;
    font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.88rem;
    background:#00153D; color:#fff;
    box-shadow:0 4px 16px rgba(0,21,61,0.22);
    display:flex; align-items:center; gap:8px;
    transition:all .2s;
  }
  .find-prof-btn:hover { background:#1E3A8A; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,21,61,0.28); }

  .edit-profile-btn {
    padding:10px; background:#F8FAFC; border:1.5px solid #E2E8F0;
    border-radius:12px; cursor:pointer; font-weight:700; font-size:.82rem;
    color:#64748B; transition:all .15s; font-family:'Instrument Sans',sans-serif;
    width:100%;
  }
  .edit-profile-btn:hover { border-color:#00153D; color:#00153D; background:#F0F4FF; }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('etdb-css')) {
    const s = document.createElement('style'); s.id = 'etdb-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ─── Avatar étudiant ──────────────────────── */
function StudentAvatar({ profil, size = 52 }) {
  const nom = `${profil?.prenom || ''} ${profil?.nom || ''}`.trim() || 'E';
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#00153D,#1E3A8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk, sans-serif', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,21,61,0.2)' }}>
      {profil?.photo_url ? <img src={`http://localhost:8001${profil.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
    </div>
  );
}

/* ─── Avatar prof ──────────────────────────── */
function ProfAvatar({ prof, size = 38 }) {
  const nom = `${prof?.user_prenom || prof?.prof_nom || ''}`.trim() || 'P';
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309']];
  const [a, b] = palettes[nom.charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk, sans-serif', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      {prof?.photo_url ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
    </div>
  );
}

/* ─── Stars ────────────────────────────────── */
function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(v) ? '#F59E0B' : '#E2E8F0', fontSize: '.78rem' }}>★</span>)}
      <span style={{ fontSize: '.7rem', color: '#94A3B8', marginLeft: 3, fontWeight: 700 }}>{v.toFixed(1)}</span>
    </span>
  );
}

/* ─── Session Card ─────────────────────────── */
function SessionCard({ r, index }) {
  const isActive   = r.session_active;
  const isImminent = r.session_imminent;
  const isToday    = r.session_today;
  const dateStr    = r.date_cours ? new Date(r.date_cours + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';

  let accent = '#3B82F6';
  let statusLabel = dateStr;
  let statusIcon  = '📅';
  if (isActive)   { accent = '#10B981'; statusLabel = 'En cours maintenant'; statusIcon = '🟢'; }
  if (isImminent) { accent = '#F59E0B'; statusLabel = `Dans ${r.minutes_until} min`; statusIcon = '⏰'; }
  if (isToday && !isActive && !isImminent) { accent = '#3B82F6'; statusLabel = `Aujourd'hui ${r.heure_debut?.slice(0,5)}`; statusIcon = '📆'; }

  return (
    <div className="session-card"
      style={{
        animationDelay: `${index * 60}ms`, animation: 'slideCard .42s cubic-bezier(.22,1,.36,1) both',
        borderLeft: `3px solid ${accent}`,
        boxShadow: isActive ? `0 0 0 3px ${accent}22` : undefined,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfAvatar prof={{ prof_nom: r.prof_nom, photo_url: r.photo_url }} size={38}/>
          <div>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.9rem', color: '#0F172A', marginBottom: 2 }}>{r.prof_nom || 'Professeur'}</div>
            <div style={{ fontSize: '.74rem', color: '#64748B', fontWeight: 600 }}>🕒 {r.heure_debut?.slice(0,5)} → {r.heure_fin?.slice(0,5)}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 800, color: accent, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            {isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'blink2 1s infinite' }}/>}
            {statusIcon} {statusLabel}
          </div>
          <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 3, fontWeight: 600 }}>
            {r.mode_seance === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel'}
          </div>
        </div>
      </div>
      {isActive && r.lien_meet && (
        <a href={r.lien_meet} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 11, textDecoration: 'none', fontSize: '.8rem', color: '#065F46', fontWeight: 800, marginTop: 10, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          🎥 Rejoindre la session →
        </a>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */
export default function EtudiantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [profs, setProfs]               = useState([]);
  const [profil, setProfil]             = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    injectCSS();
    Promise.all([
      api.get('/api/reservations/mes-reservations').catch(() => ({ data: [] })),
      api.get('/api/professeurs/').catch(() => ({ data: [] })),
      api.get('/api/etudiants/me').catch(() => ({ data: {} })),
    ]).then(([r, p, pr]) => {
      setReservations(r.data || []);
      setProfs(p.data || []);
      setProfil(pr.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const confirmes   = useMemo(() => reservations.filter(r => r.statut === 'confirmé'), [reservations]);
  const enAttente   = useMemo(() => reservations.filter(r => r.statut === 'en_attente'), [reservations]);
  const prochains   = useMemo(() => confirmes.filter(r => !r.session_past).sort((a,b) => new Date(a.date_cours) - new Date(b.date_cours)), [confirmes]);
  const passes      = useMemo(() => confirmes.filter(r => r.session_past).length, [confirmes]);

  const profsIds    = useMemo(() => new Set(reservations.map(r => r.prof_id)), [reservations]);
  const recommandes = useMemo(() =>
    profs.filter(p => p.statut_validation === 'validé')
         .sort((a,b) => (parseFloat(b.note_moyenne)||0) - (parseFloat(a.note_moyenne)||0))
         .slice(0, 4)
  , [profs, profsIds]);

  const nom    = profil?.prenom || user?.prenom || 'Étudiant';
  const niveau = profil?.niveau || '';

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) return (
    <div className="etdb-root" style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#00153D', borderRadius: '50%', animation: 'spin2 1s linear infinite', margin: '0 auto 20px' }}/>
      <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '.88rem' }}>Chargement de votre tableau de bord...</div>
    </div>
  );

  return (
    <div className="etdb-root" style={{ padding: '36px 40px', maxWidth: 1240, margin: '0 auto' }}>

      {/* ── HEADER ──────────────────────────────── */}
      <div style={{ marginBottom: 32, animation: 'fadeUp .5s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StudentAvatar profil={profil} size={58}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 4, height: 24, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
                <span style={{ fontSize: '.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: 'Cabinet Grotesk, sans-serif' }}>Tableau de bord</span>
              </div>
              <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '1.9rem', fontWeight: 900, margin: '0 0 4px', color: '#0F172A', letterSpacing: '-.03em', lineHeight: 1 }}>
                {getHour()}, {nom} 👋
              </h1>
              <p style={{ color: '#94A3B8', margin: 0, fontSize: '.88rem', fontWeight: 500, fontStyle: 'italic' }}>
                {niveau ? `Niveau : ${niveau} · ` : ''}Bienvenue sur votre espace EduMatch
              </p>
            </div>
          </div>
          <button className="find-prof-btn" onClick={() => navigate('/profs')}>
            🔍 Trouver un formateur
          </button>
        </div>
      </div>

      {/* ── STATS ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { icon: '📚', val: confirmes.length, lbl: 'Cours confirmés', numColor: '#065F46', iconBg: '#A7F3D0', border: '#6EE7B7',  path: '/reservations', delay: 0   },
          { icon: '⏳', val: enAttente.length, lbl: 'En attente',      numColor: '#B45309', iconBg: '#FDE68A', border: '#FCD34D',  path: '/reservations', delay: 60  },
          { icon: '✅', val: passes,           lbl: 'Cours passés',    numColor: '#1E40AF', iconBg: '#BFDBFE', border: '#93C5FD',  path: '/reservations', delay: 120 },
          { icon: '📅', val: prochains.length, lbl: 'Cours à venir',   numColor: '#00153D', iconBg: '#C7D2FE', border: '#A5B4FC',  path: '/reservations', delay: 180 },
        ].map(s => (
          <div key={s.lbl} className="stat-card" onClick={() => navigate(s.path)}
            style={{ animationDelay: `${s.delay}ms`, animation: 'scaleIn .45s cubic-bezier(.22,1,.36,1) both', borderColor: s.border }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '2.1rem', fontWeight: 900, color: s.numColor, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '.74rem', color: '#94A3B8', marginTop: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── GRILLE PRINCIPALE ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* COLONNE GAUCHE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Prochains cours */}
          <div className="section-card" style={{ animation: 'fadeUp .5s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
                <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>📅 Prochains cours</h3>
              </div>
              <button className="section-header-btn" onClick={() => navigate('/reservations')}>Voir tout →</button>
            </div>

            {prochains.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📭</div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 6 }}>Aucun cours à venir</div>
                <div style={{ fontSize: '.84rem', marginBottom: 18, fontStyle: 'italic' }}>Trouvez un formateur et réservez votre premier cours</div>
                <button onClick={() => navigate('/profs')}
                  style={{ padding: '10px 24px', background: '#00153D', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: '#fff', fontSize: '.85rem', boxShadow: '0 4px 14px rgba(0,21,61,0.2)' }}>
                  Réserver un cours
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prochains.slice(0, 4).map((r, i) => <SessionCard key={r.id} r={r} index={i}/>)}
              </div>
            )}
          </div>

          {/* Professeurs recommandés */}
          <div className="section-card" style={{ animation: 'fadeUp .5s .18s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(180deg,#F59E0B,#EF4444)', borderRadius: 2 }}/>
                <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>⭐ Formateurs recommandés</h3>
              </div>
              <button className="section-header-btn" onClick={() => navigate('/profs')}>Voir tous →</button>
            </div>

            {recommandes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '.85rem', fontStyle: 'italic' }}>Aucun formateur disponible</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {recommandes.map((p, i) => {
                  const profNom = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim();
                  const mats = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 2) : [];
                  return (
                    <div key={p.id} className="prof-mini-card"
                      onClick={() => navigate('/profs')}
                      style={{ animationDelay: `${i * 70 + 200}ms`, animation: 'scaleIn .4s cubic-bezier(.22,1,.36,1) both', opacity: 0, animationFillMode: 'forwards' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                        <ProfAvatar prof={p} size={38}/>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.84rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profNom}</div>
                          <Stars n={p.note_moyenne}/>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {mats.map(m => (
                          <span key={m} style={{ fontSize: '.63rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F0F4FF', color: '#1E40AF', border: '1.5px solid #C7D2FE' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profil rapide */}
          <div className="section-card" style={{ animation: 'fadeLeft .5s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1.5px solid #F1F5F9' }}>
              <div style={{ width: 4, height: 18, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
              <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>👤 Mon profil</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <StudentAvatar profil={profil} size={52}/>
              <div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.98rem', color: '#0F172A', letterSpacing: '-.01em' }}>{profil?.prenom} {profil?.nom}</div>
                <div style={{ fontSize: '.74rem', color: '#94A3B8', marginTop: 2, fontWeight: 500 }}>{profil?.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['🎓', 'Niveau',    niveau || 'Non renseigné'],
                ['📍', 'Ville',     profil?.ville || 'Non renseignée'],
                ['📞', 'Téléphone', profil?.telephone || 'Non renseigné'],
              ].map(([icon, label, val], i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.81rem', padding: '9px 0', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>{icon} {label}</span>
                  <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: val.includes('Non') ? '#CBD5E1' : '#0F172A', fontSize: '.82rem' }}>{val}</span>
                </div>
              ))}
            </div>
            <button className="edit-profile-btn" onClick={() => navigate('/profil')} style={{ marginTop: 14 }}>
              ✏️ Modifier mon profil
            </button>
          </div>

          {/* Actions rapides */}
          <div className="section-card" style={{ animation: 'fadeLeft .5s .18s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1.5px solid #F1F5F9' }}>
              <div style={{ width: 4, height: 18, background: 'linear-gradient(180deg,#F59E0B,#EF4444)', borderRadius: 2 }}/>
              <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>⚡ Actions rapides</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '👨‍🏫', label: 'Trouver un formateur', path: '/profs',        bg: '#F0F4FF', color: '#1E40AF', border: '#C7D2FE'  },
                { icon: '📋', label: 'Mes réservations',      path: '/reservations', bg: '#ECFDF5', color: '#065F46', border: '#6EE7B7'  },
                { icon: '🤖', label: 'Assistant IA',           path: '/chatbot',      bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', badge: 'NEW' },
                { icon: '👤', label: 'Mon profil',             path: '/profil',       bg: '#FFFBEB', color: '#92400E', border: '#FCD34D'  },
              ].map((a, i) => (
                <button key={a.path} className="action-btn" onClick={() => navigate(a.path)}
                  style={{ background: a.bg, border: `1.5px solid ${a.border}`, color: a.color, animationDelay: `${i * 50 + 200}ms`, animation: 'fadeLeft .4s ease both', opacity: 0, animationFillMode: 'forwards' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{a.icon}</span>
                  <span style={{ flex: 1, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-.01em' }}>{a.label}</span>
                  {a.badge && (
                    <span style={{ fontSize: '.58rem', fontWeight: 900, padding: '2px 7px', borderRadius: 20, background: a.color, color: '#fff', fontFamily: 'Cabinet Grotesk, sans-serif' }}>{a.badge}</span>
                  )}
                  <span style={{ opacity: .5, fontSize: '.85rem' }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rappel profil incomplet */}
          {(!niveau || !profil?.ville || !profil?.telephone) && (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 18, padding: 18, animation: 'fadeLeft .5s .28s ease both', opacity: 0, animationFillMode: 'forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚠️</div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, color: '#92400E', fontSize: '.88rem' }}>Profil incomplet</div>
              </div>
              <div style={{ fontSize: '.78rem', color: '#B45309', marginBottom: 12, lineHeight: 1.6, fontStyle: 'italic' }}>
                Complétez votre profil pour que les formateurs vous proposent des cours adaptés.
              </div>
              <button onClick={() => navigate('/profil')}
                style={{ width: '100%', padding: '9px', background: '#FEF3C7', border: '1.5px solid #F59E0B', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, color: '#92400E', fontSize: '.82rem', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FDE68A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FEF3C7'; }}>
                Compléter mon profil →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}